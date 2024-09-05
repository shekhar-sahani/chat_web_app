import Cookie from "js-cookie";
import jwt_decode from "jwt-decode";

export default function UseCookieData() {

  try {
    const userToken = Cookie.get("authToken");
    if (!userToken) return '';

    const decodedToken = jwt_decode(userToken);
    console.log("decodedToken",decodedToken);
    return decodedToken;
  } catch (err) {
    console.log("err", err);
  }
}
