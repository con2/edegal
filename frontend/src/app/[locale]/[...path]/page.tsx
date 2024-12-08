import AlbumView from "@/components/AlbumView";
import { redirect } from "next/navigation";
import { getAlbum } from "@/services/getAlbum";
import PictureView from "@/components/PictureView";
import { getTranslations } from "@/translations";
import { getDocumentTitle } from "@/helpers/breadcrumb";

interface Props {
  params: Promise<{
    locale: string;
    path?: string[];
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { path, locale } = await params;
  const translations = getTranslations(locale);

  const { album, picture } = await getAlbum(path?.join("/") ?? "/");

  return {
    title: getDocumentTitle(translations.BreadcrumbBar, album, picture),
    // description: album.description,
    // image: album.thumbnail?.url,
  };
}

export const revalidate = 5;

export default async function MainViewWrapper({ params }: Props) {
  const { path, locale } = await params;
  return <MainView path={path?.join("/") ?? "/"} locale={locale} />;
}

export async function MainView({
  path,
  locale,
}: {
  path: string;
  locale: string;
}) {
  const translations = getTranslations(locale);

  const { album, picture } = await getAlbum(path);

  if (album.redirect_url) {
    return redirect(album.redirect_url);
  } else if (picture) {
    return (
      <PictureView
        album={album}
        picture={picture}
        messages={{
          PictureView: translations["PictureView"],
          DownloadDialog: translations["DownloadDialog"],
          ContactDialog: translations["ContactDialog"],
        }}
      />
    );
  } else {
    return (
      <AlbumView
        album={album}
        messages={{
          AlbumView: translations["AlbumView"],
          AlbumViewFooter: translations["AlbumViewFooter"],
          AppBar: translations["AppBar"],
          BreadcrumbBar: translations["BreadcrumbBar"],
          ContactDialog: translations["ContactDialog"],
          DownloadAlbumDialog: translations["DownloadAlbumDialog"],
          LarppikuvatProfile: translations["LarppikuvatProfile"],
        }}
      />
    );
  }
}
