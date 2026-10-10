import React, { useEffect, useRef, useState } from "react";

type ActiveModal = "copyright" | "legal" | null;

const copyrightBody = `MoodMelo is an original mood-based music discovery and listening platform concept designed to associate musical experiences with emotional and situational states. The platform organizes music into defined mood categories such as Motivated, Relaxed, Romantic, Retro, Focused, Travelling, Party and Instrumental, enabling users to discover and listen to music based on how they feel or the atmosphere they wish to experience. MoodMelo combines mood-oriented categorization, curated music discovery, mood-specific visual presentation, playlist organization and a unified listening interface into a single user experience.

The MoodMelo concept includes a structured mood taxonomy, mood-specific music collections, mood-based navigation, mood-specific visual environments, curated song presentation, and an integrated music-player experience. The relationship between mood categories, music collections, visual themes, navigation flow and player interaction constitutes the documented expression of the MoodMelo concept.`;

const legalBody = `Last Updated: October 2026

MoodMelo is an independent music-discovery and listening platform created to provide users with a simple, mood-based way to discover and listen to music.

Music & Media Notice

MoodMelo does not download, extract, copy, reproduce, re-upload, or host third-party music recordings on its own servers. Where YouTube content is used, playback is provided through YouTube's embedded playback technology, and YouTube remains the source of the applicable audiovisual content.

MoodMelo does not claim ownership of any third-party music, sound recordings, compositions, lyrics, artist names, thumbnails, artwork, logos, trademarks, or other copyrighted material displayed or referenced through the platform. Ownership and applicable intellectual-property rights remain with their respective copyright owners, music labels, artists, composers, publishers, platforms, or other rights holders.

Song titles, artists, thumbnails, descriptions, and other associated information may be obtained from or associated with third-party platforms and are presented for identification, discovery, and user-experience purposes.

Independent Platform

MoodMelo is an independent project created as a music-discovery experience and is not intended to represent, impersonate, or replace YouTube, YouTube Music, any music label, artist, publisher, or other third-party music service.

The concept and user experience of MoodMelo were developed with reference to publicly available music platforms, radio experiences, and other existing digital products. MoodMelo does not claim ownership of or affiliation with those platforms unless explicitly stated.

Third-Party Content

Third-party names, trademarks, logos, music, recordings, artwork, thumbnails, and other materials remain the property of their respective owners. Their appearance on MoodMelo does not imply ownership, sponsorship, partnership, endorsement, or affiliation with MoodMelo unless expressly stated.

Where required, MoodMelo intends to provide appropriate attribution and source identification for third-party content.

Concerns, Rights & Removal Requests

If you are a copyright owner, rights holder, artist, label, publisher, representative, or other authorized party and have a concern regarding any content, metadata, image, thumbnail, song reference, or other material appearing on MoodMelo, please contact us at:

moodmelo@outlook.com

Please provide sufficient information to identify the material and explain your concern or request. We are happy to review legitimate concerns and, where appropriate, take reasonable action regarding the affected material.

No Ownership Claim

Nothing on MoodMelo should be interpreted as a claim that MoodMelo owns or controls third-party music or media unless expressly stated. All applicable rights remain with their respective owners.

Availability & Third-Party Services

MoodMelo may depend on third-party platforms and services for content availability, playback, metadata, thumbnails, or other functionality. Content availability may change or become unavailable based on actions or restrictions imposed by those third parties.

MoodMelo does not guarantee the continued availability of any particular song, recording, thumbnail, artist, or third-party content.

Changes to This Notice

MoodMelo may update this notice from time to time to reflect changes to the platform, content sources, technology, or applicable requirements. The latest version will be published on this page.`;

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeModal) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  const modalTitle = activeModal === "copyright"
    ? "MoodMelo Concept & Copyright"
    : "Legal / Content Notice";

  const modalBody = activeModal === "copyright" ? copyrightBody : legalBody;

  return (
    <footer className="site-footer">
      <div className="site-footer__bottom">
        <div className="site-footer__items">
          <button
            type="button"
            className="site-footer__item"
            onClick={() => setActiveModal("copyright")}
          >
            © 2026 MoodMelo. All rights reserved.
          </button>
          <button
            type="button"
            className="site-footer__item"
            onClick={() => setActiveModal("legal")}
          >
            Legal / Content Notice
          </button>
          <a className="site-footer__item" href="mailto:moodmelo@outlook.com">
            moodmelo@outlook.com
          </a>
        </div>
      </div>

      {activeModal && (
        <div
          className="site-footer__modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveModal(null);
            }
          }}
        >
          <section
            className="site-footer__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-footer-modal-title"
          >
            <div className="site-footer__modal-header">
              <h2 id="site-footer-modal-title">{modalTitle}</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="site-footer__modal-close"
                aria-label="Close"
                onClick={() => setActiveModal(null)}
              >
                ×
              </button>
            </div>
            <div className="site-footer__modal-content">{modalBody}</div>
          </section>
        </div>
      )}
    </footer>
  );
};

export default Footer;
