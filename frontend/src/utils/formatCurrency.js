export function formatCurrency(amount) {
  if (amount == null) return ""
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount)
}
