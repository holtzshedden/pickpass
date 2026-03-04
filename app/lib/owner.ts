export function assertOwnerKey(req: Request) {
  const expected = process.env.PICKPASS_OWNER_KEY || "";
  const key = req.headers.get("x-pickpass-owner-key") || "";
  if (!expected || key !== expected) {
    const err = new Error("Unauthorized");
    // @ts-ignore
    err.status = 401;
    throw err;
  }
}
