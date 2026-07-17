import type { Response, Request } from "express";
import * as excel from "exceljs";
import Applicant from "../models/Applicant.js";
import { Readable } from "stream";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import unzipper from "unzipper";
import env from "../config/env.js";
import Resume from "../models/Resume.js";
import { fieldnames } from "../routes/dashRoutes.js";
import { controlDebug } from "./authControl.js";

export interface Skill {
  name: string;
  level: string;
  years_of_experience: number;
}
export interface Language {
  name: string;
  proficiency: string;
}
export interface Work {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  technologies: string[];
  is_current: boolean;
}
export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
}
export interface Certification {
  name: string;
  issuer: string;
  issuer_date: string;
}
export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  start_date: string;
  end_date: string;
}
export interface Availability {
  status: string;
  type: string;
  start_date: string | null;
}
export interface Social {
  linked_in: string;
  github: string;
  portfolio: string;
}

type ApplicantInput = Record<string, unknown>;

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/[,;|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\d+(\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return fallback;
}

function normalizeApplicant(input: ApplicantInput) {
  const applicantName = firstString(input.applicant_name, input.name);
  const nameParts = applicantName.split(/\s+/).filter(Boolean);
  const firstName = firstString(input.first_name, nameParts[0], "Unknown");
  const lastName = firstString(
    input.last_name,
    nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
    "Applicant",
  );
  const email =
    firstString(input.email, input.applicant_email) ||
    `${firstName}.${lastName}.${Date.now()}@talvo.local`.toLowerCase();
  const skills = splitList(input.skills).map((name) => ({
    name,
    level: "unspecified",
    years_of_experience: toNumber(input.experience_in_years),
  }));

  return {
    first_name: firstName,
    last_name: lastName,
    email,
    headline: firstString(input.headline, input.job_title, "Candidate"),
    bio: firstString(input.bio, input.additional_info, "Profile imported into Talvo."),
    location: firstString(input.location, "Not provided"),
    skills,
    language: splitList(input.languages).map((name) => ({
      name,
      proficiency: "unspecified",
    })),
    experience: [
      {
        company: firstString(input.company, "Not provided"),
        role: firstString(input.job_title, "Candidate"),
        start_date: "",
        end_date: "",
        technologies: splitList(input.skills),
        is_current: false,
      },
    ],
    education: splitList(input.education_certificates).map((name) => ({
      institution: name,
      degree: name,
      field_of_study: "",
      start_year: 0,
      end_year: 0,
    })),
    certifications: [],
    projects: [],
    availability: {
      status: "unknown",
      type: "unknown",
      start_date: null,
    },
    social_links: {
      linked_in: firstString(input.linkedin, input.linkedIn),
      github: firstString(input.github),
      portfolio: firstString(input.portfolio),
    },
    job_title: firstString(input.job_title, "Imported role"),
    applicant_state: "Queued",
  };
}

async function readSpreadsheet(file: Express.Multer.File) {
  const workbook = new excel.Workbook();
  const rows: ApplicantInput[] = [];

  if (file.originalname.endsWith(".csv") || file.mimetype === "text/csv") {
    const worksheet = await workbook.csv.read(Readable.from(file.buffer));
    const headers: string[] = [];
    worksheet.eachRow((row, rowNumber) => {
      const values = (row.values as unknown[]).slice(1);
      if (rowNumber === 1) {
        headers.push(...values.map(normalizeHeader));
        return;
      }
      const item: ApplicantInput = {};
      values.forEach((value, index) => {
        const header = headers[index];
        if (header) item[header] = value;
      });
      rows.push(item);
    });
    return rows;
  }

  await workbook.xlsx.load(file.buffer as any);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) return rows;
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell) => headers.push(normalizeHeader(cell.value)));
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const item: ApplicantInput = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) item[header] = cell.value?.toString();
    });
    rows.push(item);
  });
  return rows;
}

async function createApplicants(inputs: ApplicantInput[]) {
  const applicants = [];
  let skippedCount = 0;

  for (const input of inputs) {
    const applicantData = normalizeApplicant(input);
    const existing = await Applicant.findOne({ email: applicantData.email });
    if (existing) {
      skippedCount += 1;
      applicants.push(existing);
      continue;
    }
    applicants.push(await Applicant.create(applicantData));
  }

  return {
    applicants,
    createdCount: applicants.length - skippedCount,
    skippedCount,
  };
}

async function enrichResumesFromZip(file: Express.Multer.File) {
  if (
    !env.CLOUDINARY_API_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET ||
    !env.GOOGLE_API_KEY
  ) {
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_API_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  const directory = await unzipper.Open.buffer(file.buffer);
  for (const entry of directory.files) {
    if (entry.type !== "File" || !entry.path.toLowerCase().endsWith(".pdf")) continue;
    const applicantFileName = entry.path.replace(/\.[^.]+$/, "");
    const applicant =
      (await Applicant.findOne({ email: applicantFileName })) ||
      (await Applicant.findOne({
        first_name: applicantFileName.split(" ")[0] ?? "",
        last_name: applicantFileName.split(" ").slice(1).join(" "),
      } as any));
    if (!applicant) continue;

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "talvo-resumes", resource_type: "auto" },
        (error, uploaded) => {
          if (error) reject(error);
          if (uploaded) resolve(uploaded);
        },
      );
      entry.stream().pipe(stream);
    });

    await Resume.create({
      applicant_id: applicant._id,
      job_title: applicant.job_title,
      resume_pdf_url: result.secure_url,
    });
  }
}

const applicantControl = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const spreadsheetField = fieldnames[0] ?? "applicants_spreadsheet";
    const resumeField = fieldnames[1] ?? "resume_pdf_zip";
    const spreadsheet = files?.[spreadsheetField]?.[0];
    const resumeZip = files?.[resumeField]?.[0];

    const bodyApplicants = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.applicants)
        ? req.body.applicants
        : typeof req.body?.raw_application_data === "string"
          ? JSON.parse(req.body.raw_application_data)
          : [];

    const inputs = spreadsheet ? await readSpreadsheet(spreadsheet) : bodyApplicants;
    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({ data_error: "Applicant data is required" });
    }

    const result = await createApplicants(inputs);
    if (resumeZip) {
      enrichResumesFromZip(resumeZip).catch((error) =>
        controlDebug("Resume enrichment failed: " + String(error)),
      );
    }

    return res.status(201).json({
      success: "Applicants processed successfully",
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      applicants: result.applicants,
    });
  } catch (error) {
    controlDebug(error);
    return res.status(500).json({ server_error: "Internal server error" });
  }
};

export default applicantControl;
