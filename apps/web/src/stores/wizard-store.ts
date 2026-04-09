import { create } from 'zustand';

export interface RecipientPreview {
  phoneNumber: string;
  variables: Record<string, string>;
}

export interface ValidationSummary {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  autoCorrectCount: number;
  detectedColumns: string[];
  sampleRows: Record<string, string>[];
  invalidReasons: { reason: string; count: number }[];
}

interface WizardState {
  // Step A
  campaignId: string | null;
  campaignName: string;
  campaignNotes: string;

  // Step B
  fileName: string | null;
  fileSize: number | null;
  validation: ValidationSummary | null;
  recipients: RecipientPreview[];

  // Step C
  templateBody: string;
  variableMapping: Record<string, string>;

  // Actions
  setCampaignDetails: (id: string, name: string, notes: string) => void;
  setFileData: (fileName: string, fileSize: number, validation: ValidationSummary, recipients: RecipientPreview[]) => void;
  setTemplate: (body: string, mapping: Record<string, string>) => void;
  reset: () => void;
}

const initialState = {
  campaignId: null,
  campaignName: '',
  campaignNotes: '',
  fileName: null,
  fileSize: null,
  validation: null,
  recipients: [],
  templateBody: '',
  variableMapping: {},
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setCampaignDetails: (id, name, notes) =>
    set({ campaignId: id, campaignName: name, campaignNotes: notes }),

  setFileData: (fileName, fileSize, validation, recipients) =>
    set({ fileName, fileSize, validation, recipients }),

  setTemplate: (body, mapping) =>
    set({ templateBody: body, variableMapping: mapping }),

  reset: () => set(initialState),
}));
