export class SupabaseHelper {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async loginWithPassword(email, password) {
    try {
      const res = await fetch(`${this.apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        console.warn(`Login failed for ${email}: ${res.status}`);
        return null;
      }
      const data = await res.json();
      return data.session || data;
    } catch (err) {
      console.warn(`Cannot connect to backend at ${this.apiUrl}: ${err.message}`);
      return null;
    }
  }

  async register(email, password) {
    const res = await fetch(`${this.apiUrl}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }

  async verifyPhone(phone) {
    const res = await fetch(`${this.apiUrl}/users/phone/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  }
}
