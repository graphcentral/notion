import React from "react";
import { useTypedTheme } from "src/theme";
import { enhance } from "src/utilities/essentials";
import Guide0Image from "src/assets/guide0.png";
import Guide1Image from "src/assets/guide1.png";
import Guide2Image from "src/assets/guide2.png";
import Guide3Image from "src/assets/guide3.png";
import Guide4Image from "src/assets/guide4.png";
/** @jsx jsx */
import { jsx } from "@emotion/react";

export const HowToAndTroubleShooting = enhance(() => {
  const theme = useTypedTheme();

  return (
    <>
      <h2
        css={{
          color: theme.colors.whitePrimary,
          textAlign: `center`,
        }}
      >
        How to & Troubleshooting
      </h2>
      <article
        css={{
          padding: `1rem`,
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
        }}
      >
        <h3
          css={{
            color: theme.colors.whitePrimary,
            width: `100%`,
          }}
        >
          1. Locate your Notion page
        </h3>
        <p
          css={{
            width: `100%`,
            padding: `0.5rem 0`,
          }}
        >
          Preferably choose the page that has many children, because you want to
          see a knowledge graph of some extent.
        </p>
        <img src={Guide0Image} alt="Locate your Notion page" width="50%" />
      </article>
      <article
        css={{
          padding: `1rem`,
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
        }}
      >
        <h3
          css={{
            color: theme.colors.whitePrimary,
            width: `100%`,
          }}
        >
          2. Make your page public
        </h3>
        <p
          css={{
            width: `100%`,
            padding: `0.5rem 0`,
          }}
        >
          Click on 'Share' at the top right corner, and turn on the toggle for
          'Share to web'.
        </p>
        <img
          css={{
            padding: `1rem 0`,
          }}
          src={Guide1Image}
          alt="Click on 'Share' at the top right corner"
          width="50%"
        />
        <img
          css={{
            padding: `1rem 0`,
          }}
          src={Guide2Image}
          alt="Turn on the toggle for 'Share to web' step #1"
          width="50%"
        />
        <img
          css={{
            padding: `1rem 0`,
          }}
          src={Guide3Image}
          alt="Turn on the toggle for 'Share to web' step #2"
          width="50%"
        />
      </article>
      <article
        css={{
          padding: `1rem`,
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
        }}
      >
        <h3
          css={{
            color: theme.colors.whitePrimary,
            width: `100%`,
          }}
        >
          3. Bring the link from Notion to this website
        </h3>
        <p
          css={{
            width: `100%`,
            padding: `0.5rem 0`,
          }}
        >
          Click on 'Copy web link', and paste the link into the input above on
          this website
        </p>
        <img
          src={Guide4Image}
          alt="Bring the link from Notion to this website"
          width="50%"
        />
      </article>
    </>
  );
})();
