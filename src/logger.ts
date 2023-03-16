const colors = {
  reset: "\x1b[0m", // white
  fail: "\x1b[31m", // red
  success: "\x1b[32m", // green
  highlight: "\x1b[33m", // yellow
  system: "\x1b[35m", // magenta
  neutral: "\x1b[36m", // cian
  control: "\x1b[90m", // gray
} as const;

type ColorKey = keyof typeof colors;

const coloredText = (text: string | number, color: ColorKey): string =>
  `${colors[color]}${text}${colors.reset}`;

const brackets = (
  text: string | number,
  color = "control" as ColorKey
): string => `${coloredText("[", color)}${text}${coloredText("]", color)}`;

const separator = coloredText(":", "control");

const now = (color: ColorKey = "reset"): string => {
  const splitTimestamp = new Date()
    .toLocaleTimeString("en-US", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
    .split(":")
    .map((time) => coloredText(time, color));

  return brackets(splitTimestamp.join(separator), "control");
};

export const broadcast = (text: string, color: ColorKey) =>
  console.log(`${now(color)} ${text}`);
