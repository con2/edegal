export interface LarppikuvatProfile {
  contact: string;
  hours: string;
  delivery_schedule: string;
  delivery_practice: string;
  delivery_method: string;
  copy_protection: string;
  expected_compensation: string;
}

export default interface Photographer {
  path: string;
  display_name: string;
  homepage_url: string;
  twitter_handle: string;
  instagram_handle: string;
  threads_handle: string;
  facebook_handle: string;
  flickr_handle: string;
  bluesky_handle: string;
  has_email: boolean;

  larppikuvat_profile?: LarppikuvatProfile;
}
