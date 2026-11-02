const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
initializeApp();
const db = getDatabase();

// Requests are demo-only. No payment processor or real-money transfer is connected.
exports.createDemoRequest = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "سجل الدخول أولاً");
  const { type, amount, method, phone } = req.data || {};
  if (!["deposit", "withdrawal"].includes(type)) throw new HttpsError("invalid-argument", "نوع الطلب غير صحيح");
  if (!Number.isFinite(amount) || amount < 1 || amount > 20000) throw new HttpsError("invalid-argument", "المبلغ غير صحيح");
  if (typeof method !== "string" || method.length > 40) throw new HttpsError("invalid-argument", "وسيلة غير صحيحة");
  const item = { uid: req.auth.uid, type, amount, method, phone: String(phone || "").slice(0,20), status: "pending", createdAt: Date.now(), demo: true };
  const ref = await db.ref(`${type}Requests`).push(item);
  return { ok: true, id: ref.key, status: item.status };
});

// Only callable by a trusted administrator assigned custom claim {admin:true} by Admin SDK.
exports.adminSetDemoBalance = onCall(async (req) => {
  if (!req.auth || req.auth.token.admin !== true) throw new HttpsError("permission-denied", "صلاحية الأدمن مطلوبة");
  const { uid, balance } = req.data || {};
  if (typeof uid !== "string" || !Number.isFinite(balance) || balance < 0 || balance > 1000000) throw new HttpsError("invalid-argument", "بيانات غير صحيحة");
  await db.ref(`users/${uid}/balance`).set(balance);
  await db.ref(`audit/${Date.now()}_${uid}`).set({ by: req.auth.uid, action: "set_demo_balance", balance, at: Date.now() });
  return { ok: true };
});
