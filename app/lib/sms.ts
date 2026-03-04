export async function sendPickupSms(params: {
  toPhone: string;
  link: string;
  storeName: string;
}) {
  // MVP: nur stub, später Twilio o.ä.
  console.log("[PickPass SMS stub]", params);
  return { ok: true };
}
