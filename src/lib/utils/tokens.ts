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

// Type guard for verified tokens
export function isVerifiedProjectToken(
  payload: any
): payload is ProjectTokenPayload {
  return (
    payload &&
    typeof payload.projectId === 'string' &&
    typeof payload.agencyId === 'string'
  );
}