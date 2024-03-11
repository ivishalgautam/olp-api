export function generateOrderId() {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${randomNum}`;
}
