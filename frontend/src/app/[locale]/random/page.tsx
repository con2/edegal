import { MainView } from "../[...path]/page";
export { generateMetadata } from "../[...path]/page";

export const revalidate = 0;

interface Props {
  locale: string;
}

export default function RandomPictureView({ locale }: Props) {
  return <MainView path="/random" locale={locale} />;
}
