import { createContext, useContext, useEffect, useState } from "react";
import UserService from "../service/userService";

// สร้าง context สำหรับแชร์สถานะผู้ใช้
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // เก็บสถานะผู้ใช้และสถานะกำลังเช็ก session
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // เข้าสู่ระบบ
  const login = async ({ email, password }) => {
    const res = await UserService.loginUser({ email, password });
    // รองรับทั้งกรณี {data: {...}} และ object ตรง ๆ
    const data = res?.data ?? res;
    setUser(data?.user || data);
    return data;
  };

  // ออกจากระบบ
  const logout = async () => {
    await UserService.logoutUser();
    setUser(null);
  };

  // เปิดเว็บมาเช็กว่าเคยล็อกอินจาก cookie อยู่ไหม
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await UserService.getUserProfile();
        const me = res?.data ?? res;
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook ช่วยเรียกใช้ context ได้ง่าย
export const useAuthContext = () => useContext(AuthContext);

// เผื่ออยาก import แบบ default
export default AuthContext;