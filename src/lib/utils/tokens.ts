import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface ProjectTokenPayload {
  clientName: string;
  clientEmail: string;
  projectBudget: number;
  projectDuration: number;
  iat?: number;
  exp?: number;
}

// Type guard for verified tokens
interface VerifiedProjectTokenPayload extends ProjectTokenPayload {
  projectId: string;
  agencyId: string;
}

export async function generateProjectToken(
  payload: ProjectTokenPayload
): Promise<string> {
  const { clientName, clientEmail, projectBudget, projectDuration } = payload;
  
  // Set expiration (project duration + 5 days buffer, or default 30 days)
  const expirationDays = projectDuration ? projectDuration + 5 : 30;
  
  return await new SignJWT({
    clientName,
    clientEmail,
    projectBudget,
    projectDuration
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expirationDays}d`)
    .sign(JWT_SECRET);
}

export async function verifyProjectToken(
  token: string
): Promise<ProjectTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Validate required claims
    if (!payload.projectId || !payload.agencyId) {
      throw new Error("Invalid token payload");
    }

    return {
      clientName: payload.clientName as string,
      clientEmail: payload.clientEmail as string,
      projectBudget: Number(payload.projectBudget),
      projectDuration: Number(payload.projectDuration),
      iat: payload.iat ? Number(payload.iat) : undefined,
      exp: payload.exp ? Number(payload.exp) : undefined
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function isVerifiedProjectToken(
  payload: unknown
): payload is VerifiedProjectTokenPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).projectId === 'string' &&
    typeof (payload as Record<string, unknown>).agencyId === 'string'
  );
}