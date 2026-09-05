const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function joinRoomApi(userId: string, code: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/join?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.detail || 'Room code not found' };
    }
    const room = await res.json();
    return { success: true, room };
  } catch {
    return { success: false, isOffline: true };
  }
}

export async function createRoomApi(userId: string, name: string, code: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.detail || 'Failed to create room' };
    }
    const room = await res.json();
    return { success: true, room };
  } catch {
    return { success: false, isOffline: true };
  }
}

export async function fetchUserRoomsApi(userId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
