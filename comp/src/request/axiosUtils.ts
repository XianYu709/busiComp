import axios from "axios";

export default class AxiosUtils {
  //默认超时时间20s
  private static readonly TIME_OUT_MILLISECONDS = 20000;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async generalRequest(params: any): Promise<any> {
    const { method, url, data = {} } = params;
    let ret;
    try {
      ret = await axios({ method, url, data, timeout: this.TIME_OUT_MILLISECONDS });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("url is ", url, "param is ", data, "axios eror is ", error);
    }
    return ret;
  }
}
