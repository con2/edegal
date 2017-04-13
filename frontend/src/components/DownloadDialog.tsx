import * as React from 'react';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';

import { State } from '../modules';
import { closeDownloadDialog } from '../modules/downloadDialog';
import Picture from '../models/Picture';


interface DownloadDialogOwnProps {}
interface DownloadDialogStateProps {
  isOpen: boolean;
  picture: Picture;
}
interface DownloadDialogDispatchProps {
  closeDownloadDialog: typeof closeDownloadDialog;
}
type DownloadDialogProps = DownloadDialogOwnProps & DownloadDialogStateProps & DownloadDialogDispatchProps;
interface DownloadDialogState {
  acceptTermsAndConditions: boolean;
}


class DownloadDialog extends React.Component<DownloadDialogProps, DownloadDialogState> {
  state: DownloadDialogState = {
    acceptTermsAndConditions: false
  };

  render() {
    const picture = this.props.picture;

    if (!picture.original) {
      throw new Error('cannot download the original of a picture that does not have one');
    }

    if (!picture.terms_and_conditions) {
      throw new Error('the picture does not have T&C, why did we open this dialog?');
    }

    const actions = [
      (
        <FlatButton
          label="Peruuta"
          primary={true}
          onTouchTap={this.props.closeDownloadDialog}
        />
      ),
      (
        <FlatButton
          label="Lataa"
          primary={true}
          keyboardFocused={true}
          disabled={!this.state.acceptTermsAndConditions}
          href={picture.original.src}
          onTouchTap={this.props.closeDownloadDialog}
        />
      ),
    ];

    return (
      <Dialog
        title="Lataa alkuperäinen kuva"
        open={this.props.isOpen}
        actions={actions}
      >
        <p>Kuvaaja on asettanut kuvan käytölle seuraavat ehdot:</p>
        <p>{picture.terms_and_conditions.text}</p>
        <p>Kuvan lataaminen edellyttää, että hyväksyt ehdot.</p>
        <Checkbox
          label="Hyväksyn ehdot"
          checked={this.state.acceptTermsAndConditions}
          onCheck={this.handleCheck}
        />
      </Dialog>
    );
  }

  handleCheck = (event: {}, isChecked: boolean) => {
    this.setState({ acceptTermsAndConditions: isChecked });
  }
}


const mapStateToProps = (state: State) => ({
  isOpen: state.downloadDialog.isOpen,
  picture: state.picture,
});

const mapDispatchToProps = { closeDownloadDialog };


export default connect<DownloadDialogStateProps, DownloadDialogDispatchProps, DownloadDialogOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(DownloadDialog);
