import Breadcrumb from "./Breadcrumb";
import Picture from "./Picture";
import Subalbum from "./Subalbum";
import TermsAndConditions from "./TermsAndConditions";
import Credits from "./Credits";

export type Layout = "yearly" | "simple";

interface Album {
  path: string;
  title: string;
  body: string;
  subalbums: Subalbum[];
  pictures: Picture[];
  breadcrumb: Breadcrumb[];
  redirect_url: string;
  is_downloadable: boolean;
  download_url: string;
  date: string;
  layout: Layout;
  terms_and_conditions?: TermsAndConditions;
  next_in_series?: Breadcrumb;
  previous_in_series?: Breadcrumb;
  cover_picture?: Picture;
  credits: Credits;
}

export default Album;
