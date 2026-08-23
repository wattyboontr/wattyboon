export interface SavedDeviceAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  lastLoginAt: string;
  authProvider?: 'google' | 'firebase' | 'local' | string;
}

const SAVED_ACCOUNTS_KEY = 'wattyboon_device_saved_accounts';

export function getSavedDeviceAccounts(): SavedDeviceAccount[] {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort(
          (a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime()
        );
      }
    }
  } catch (e) {
    console.warn('Error reading saved device accounts:', e);
  }
  return [];
}

export function addSavedDeviceAccount(user: {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  authProvider?: string;
}): SavedDeviceAccount[] {
  try {
    const current = getSavedDeviceAccounts();
    const existingIndex = current.findIndex(
      (acc) =>
        acc.id === user.id ||
        (acc.email && acc.email.toLowerCase() === user.email.toLowerCase()) ||
        (acc.username && acc.username.toLowerCase() === user.username.toLowerCase())
    );

    const updatedAccount: SavedDeviceAccount = {
      id: user.id,
      name: user.name || 'WattyBoon Okuru',
      username: user.username || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      lastLoginAt: new Date().toISOString(),
      authProvider: user.authProvider || (user.email.includes('gmail') ? 'google' : 'firebase'),
    };

    let updatedList: SavedDeviceAccount[];
    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = updatedAccount;
    } else {
      updatedList = [updatedAccount, ...current];
    }

    // Keep up to 8 recent device accounts
    updatedList = updatedList.slice(0, 8);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.warn('Error saving device account:', e);
    return getSavedDeviceAccounts();
  }
}

export function removeSavedDeviceAccount(userIdOrEmail: string): SavedDeviceAccount[] {
  try {
    const current = getSavedDeviceAccounts();
    const target = userIdOrEmail.toLowerCase();
    const filtered = current.filter(
      (acc) => acc.id !== userIdOrEmail && acc.email.toLowerCase() !== target && acc.username.toLowerCase() !== target
    );
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.warn('Error removing device account:', e);
    return getSavedDeviceAccounts();
  }
}

export function clearAllSavedDeviceAccounts(): void {
  try {
    localStorage.removeItem(SAVED_ACCOUNTS_KEY);
  } catch (e) {
    console.warn('Error clearing device accounts:', e);
  }
}
