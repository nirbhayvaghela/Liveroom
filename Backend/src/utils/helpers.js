export function generateRoomId() {
  const timestamp = Date.now().toString(36); // e.g., 'cmatpr6360'
  const randomPart = Math.random().toString(36).replace(/[^a-z0-9]/g, '').substr(0, 8); // e.g., '1ig0v1w5'

  // Optional: Use hyphen for readability, e.g., 'cmatpr6360-1ig0v1w5'
  const formattedId = `${timestamp}-${randomPart}`.toUpperCase(); // uppercase for clarity

  return formattedId;
}
