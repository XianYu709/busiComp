export function waitForElementById(
  id: string,
  maxTry = 10,
  interval = 50,
  doc = document,
): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    let count = 0;
    const timer = setInterval(() => {
      const el = doc.getElementById(id);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if (++count >= maxTry) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}
