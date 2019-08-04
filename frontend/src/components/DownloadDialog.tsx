import React from 'react';
import Album from '../models/Album';
import { Translation } from 'react-i18next';
import Linebreaks from './Linebreaks';


interface DownloadDialogProps {
  ns: string;
  album: Album;
  preparing?: boolean;
  onClose(): void;
  onAccept(): void;
}


const DownloadDialog: React.FC<DownloadDialogProps> = ({ album, onAccept, onClose, ns, preparing }) => {
  const [isTermsAndConditionsAccepted, toggleTermsAndConditionsAccepted] = React.useReducer(accepted => !accepted, false);
  const [downloadButtonClicked, setDownloadButtonClicked] = React.useState(false);
  const handleAccept = () => { setDownloadButtonClicked(true); onAccept(); }

  const text = album && album.terms_and_conditions ? album.terms_and_conditions.text : '';
  const { photographer, director } = album.credits;

  const haveTwitter = (photographer && photographer.twitter_handle) || (director && director.twitter_handle);
  const haveInstagram = (photographer && photographer.instagram_handle) || (director && director.instagram_handle);
  const haveCredit = (photographer && photographer.display_name) || (director && director.display_name);

  return (
    <Translation ns={ns}>
      {(t) => (
        <div className="DownloadDialog modal fade show" style={{ display: "block" }} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('dialogTitle')}</h5>
                <button type="button" className="close" onClick={onClose} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <p><strong>{t('termsAndConditions')}</strong></p>
                <Linebreaks text={text || t('defaultTerms')} />

                {photographer && photographer.email ? <p><strong>{t('contact')}</strong> {photographer.email}</p> : null}

                {haveTwitter ? (
                  <>
                    <p><strong>{t('twitterCredit')}</strong></p>
                    <p>
                      {photographer ? <>📸 {photographer.twitter_handle ? `@${photographer.twitter_handle}` : photographer.display_name} </> : null}
                      {director ? <>🎬 {director.twitter_handle ? `@${director.twitter_handle}` : director.display_name} </> : null}
                    </p>
                  </>
                ) : null}

                {haveInstagram ? (
                  <>
                    <p><strong>{t('instagramCredit')}</strong></p>
                    <p>
                      {photographer ? <>{t('photographer')}: {photographer.instagram_handle ? `@${photographer.instagram_handle}` : photographer.display_name}<br /></> : null}
                      {director ? <>{t('director')}: {director.instagram_handle ? `@${director.instagram_handle}` : director.display_name}<br/></> : null}
                    </p>
                  </>
                ) : null}

                {haveCredit ? (
                  <>
                    <p><strong>{haveTwitter || haveInstagram ? t('genericCredit') : t('genericCreditAlternative')}</strong></p>
                    <p>
                      {photographer && photographer.display_name ? <>{t('photographer')}: {photographer.display_name}<br /></> : null}
                      {director && director.display_name ? <>{t('director')}: {director.display_name}<br /></> : null}
                    </p>
                  </>
                ) : null}
              </div>

              <div className="modal-footer">
                <label className="mr-auto mt-2">
                  <input type="checkbox" disabled={downloadButtonClicked} checked={isTermsAndConditionsAccepted} onChange={toggleTermsAndConditionsAccepted} />
                  {' ' + t('acceptTermsAndConditions')}
                </label>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!isTermsAndConditionsAccepted || preparing}
                  onClick={handleAccept}
                >
                  {preparing ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden={true} /> : null}
                  {` ${preparing ? t('preparingDownloadButtonText') + '…' : t('downloadButtonText')}`}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>{t('closeButtonText')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Translation>
  );
}

export default DownloadDialog;
