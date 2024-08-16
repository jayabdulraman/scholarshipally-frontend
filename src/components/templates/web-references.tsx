'use client'

/* eslint-disable @next/next/no-img-element */
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza';
import DOMPurify from "isomorphic-dompurify";
import { BingResults } from '@/lib/types';

export function WebReferences({
  props: searchResults,
}: {
  props: BingResults | null | [];
}) {
  const extractDomain = (url: string) => {
    try {
      const { hostname } = new URL(url);
      return hostname;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };
  return (
    <>
      <Credenza>
        <div className="max-w-3xl mx-auto p-2 rounded-lg">
          <h2 className="text-black text-lg font-semibold mb-3">Sources:</h2>
          <div className="flex flex-row space-x-2 overflow-x-auto">
              {/* @ts-ignore */}
            {searchResults?.web.results.slice(0, 3).map((item, index) => (
                <div key={index} className="flex-shrink-0 w-60 p-2 rounded-xl bg-opacity-30 border border-neutral-400">
                  <h3 className="text-black text-sm font-medium mb-1 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center text-gray-400 text-xs">
                    <img
                      src={item.meta_url.favicon}
                      alt={item.description}
                      className="w-4 h-4 object-cover rounded"
                    />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-4 p-4 items-center"
                    >
                      <span>{extractDomain(item.url)}</span>
                    </a>
                  </div>
                </div>
              ))}
              {/* @ts-ignore */}
              {searchResults.web.results.length > 3 && (
                  <CredenzaTrigger className="bg-white border border-neutral-400 backdrop-blur-md rounded-xl bg-opacity-50 w-28 flex flex-col gap-4 p-4 h-32 cursor-pointer">
                    <div className="flex flex-col gap-4 p-2">
                      <h2 className="font-semibold">
                        {/* @ts-ignore */}
                        View {searchResults.web.results.length - 3} more
                      </h2>
                    </div>
                  </CredenzaTrigger>
              )}
          </div>
        </div>
        {/* <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-row gap-4 overflow-x-auto mt-4">
            {searchResults?.web.results.slice(0, 4).map((item, index) => (
              <div
                key={`SearchResults-${index}`}
                className="bg-white border border-neutral-400 backdrop-blur-md rounded-xl bg-opacity-30 w-80 flex flex-col gap-4 p-2"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-4 items-center"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <img
                        src={item.meta_url.favicon}
                        alt={item.description}
                        className="w-4 h-4 object-cover rounded"
                      />
                      <div className="font-semibold line-clamp-2 text-sm text-neutral-500">
                        {item.title}
                      </div>
                    </div>
                    <p
                      className="text-sm line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(item.description),
                      }}
                    ></p>
                  </div>
                </a>
              </div>
            ))}

            {searchResults.web.results.length > 4 && (
              <CredenzaTrigger className="bg-white backdrop-blur-md rounded-xl bg-opacity-50 w-96 flex flex-col gap-4 p-4 h-32 cursor-pointer">
                <div className="flex flex-col gap-4 p-4">
                  <h2 className="font-semibold">
                    {searchResults.web.results.length - 4} more results
                  </h2>
                </div>
              </CredenzaTrigger>
            )}
          </div> */}

          {/* <div className="flex gap-4 overflow-x-auto mt-4">
            {searchResults?.web.results.slice(0, 6).map((item: any) => {
              const src = item.thumbnail?.src;

              if (!src) return null;

              return (
                <img
                  key={item.url}
                  src={src}
                  alt={item.description}
                  className="w-24 h-24 object-cover rounded"
                />
              );
            })}
            {searchResults.web.results.length > 4 && (
              <div className="relative w-24 h-24">
                <img
                  src="/placeholder.svg"
                  className="w-full h-full object-cover rounded"
                  alt="placeholder"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <span className="text-white text-xl font-bold">
                    +{searchResults.web.results.length - 4}
                  </span>
                </div>
              </div>
            )}
          </div> */}
        {/* </div> */}

        <CredenzaContent className="max-h-[80vh] overflow-y-auto ">
          <CredenzaHeader>
            <CredenzaTitle>References</CredenzaTitle>
            <CredenzaDescription>
              Search results from the web
            </CredenzaDescription>
          </CredenzaHeader>
          <div>
            {/* @ts-ignore */}
            {searchResults?.web.results.map((item: any) => (
              <div
                key={item.url}
                className="p-4 bg-[#f4eaea] rounded-sm cursor-pointer my-2 mx-2"
                onClick={() => {
                  window.open(item.url, '_blank');
                }}
              >
                <h2 className="font-semibold line-clamp-2 text-lg">
                  {item.title}
                </h2>
                <div className="flex gap-2 items-center  rounded-full w-auto my-1">
                  <img
                    src={item.meta_url.favicon}
                    alt={item.description}
                    className="w-4 h-4 object-cover rounded"
                  />
                  <p>{extractDomain(item.url)}</p>
                </div>
                <p
                  className="text-sm line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.description),
                  }}
                ></p>
              </div>
            ))}
          </div>
        </CredenzaContent>
      </Credenza>
    </>
  );
}