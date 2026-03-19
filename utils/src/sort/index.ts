export const sortByField = (
  data: any[],
  field: string,
  order: "asc" | "desc" = "asc",
  isPercent: boolean = false,
) => {
  return data.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (isPercent) {
      valA = parseFloat(valA.replace("%", "")) || 0;
      valB = parseFloat(valB.replace("%", "")) || 0;
    }

    if (typeof valA === "number" && typeof valB === "number") {
      return order === "asc" ? valA - valB : valB - valA;
    }

    valA = String(valA);
    valB = String(valB);
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterByRange = (
  data: any[],
  field: string,
  min?: number | string,
  max?: number | string,
  isPercent: boolean = false,
) => {
  if (!Array.isArray(data)) return [];

  const parsePercentValue = (input: number | string | undefined) => {
    if (input === undefined || input === null || input === "") return NaN;

    if (typeof input === "string") {
      return parseFloat(input.replace("%", ""));
    }

    return Number(input);
  };

  const minNum = parsePercentValue(min);
  const maxNum = parsePercentValue(max);
  const useHundredScale =
    isPercent && ((Number.isFinite(minNum) && minNum > 1) || (Number.isFinite(maxNum) && maxNum > 1));

  return data.filter(item => {
    let value = item[field];

    if (isPercent) {
      if (typeof value === "string") {
        value = parseFloat(value.replace("%", ""));
      } else {
        value = Number(value);
      }

      // Some APIs return scoringRate as 0~1 while UI bounds are 0~100.
      if (useHundredScale && Number.isFinite(value) && value <= 1) {
        value = value * 100;
      }
    } else {
      value = Number(value);
    }

    if (!Number.isFinite(value)) return false;

    if (!isNaN(minNum) && value < minNum) return false;
    if (!isNaN(maxNum) && value > maxNum) return false;

    return true;
  });
};
