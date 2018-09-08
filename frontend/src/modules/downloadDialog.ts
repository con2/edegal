import OtherAction from './other';


export type OpenDownloadDialog = 'edegal/downloadDialog/OpenDownloadDialog';
export const OpenDownloadDialog: OpenDownloadDialog = 'edegal/downloadDialog/OpenDownloadDialog';

export interface OpenDownloadDialogAction {
  type: OpenDownloadDialog;
}

export function openDownloadDialog(): OpenDownloadDialogAction {
  return { type: OpenDownloadDialog };
}


export type CloseDownloadDialog = 'edegal/downloadDialog/CloseDownloadDialog';
export const CloseDownloadDialog: CloseDownloadDialog = 'edegal/downloadDialog/CloseDownloadDialog';

export interface CloseDownloadDialogAction {
  type: CloseDownloadDialog;
}

export function closeDownloadDialog(): CloseDownloadDialogAction {
  return { type: CloseDownloadDialog };
}


export interface DownloadDialogState {
  isOpen: boolean;
}

const initialState: DownloadDialogState = {
  isOpen: false,
};


type DownloadDialogAction = OpenDownloadDialogAction
  | CloseDownloadDialogAction
  | OtherAction;

export default function downloadDialog(
  state: DownloadDialogState = initialState,
  action: DownloadDialogAction = OtherAction,
) {
  switch (action.type) {
    case OpenDownloadDialog:
      return { isOpen: true };
    case CloseDownloadDialog:
      return { isOpen: false };
    default:
      return initialState;
  }
}
