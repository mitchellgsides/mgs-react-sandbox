declare module "fit-file-parser";

interface FitData {
  messages: FitMessage[];
}

interface FitMessage {
  name: string;
  global_message_number: number;
  fields: FitField[];
}

interface FitField {
  name: string;
  value: unknown;
  units?: string;
}
