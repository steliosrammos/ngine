import { useMemo } from "react";
import { HStack, Text } from "@chakra-ui/react";
import type { AvatarProps, TextProps } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import Avatar from "./Avatar";
import useProfile from "../hooks/useProfile";
import { useLink, useLinkComponent } from "../context";

interface UserProps
  extends AvatarProps,
    Pick<AvatarProps, "size">,
    Pick<TextProps, "color" | "fontSize" | "fontWeight"> {
  pubkey: string;
}

function shortenPubkey(pk: string) {
  return `${pk.slice(0, 8)}`;
}

// todo: tags on profile for custom emoji
export default function User({
  pubkey,
  color = "chakra-body-text",
  fontSize,
  fontWeight,
  size = "sm",
  ...rest
}: UserProps) {
  const Link = useLinkComponent();
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  const url = useLink("npub", npub);
  const profile = useProfile(pubkey);
  const component = (
    <HStack>
      <Avatar pubkey={pubkey} size={size} />
      <Text color={color} fontSize={fontSize} fontWeight={fontWeight}>
        {profile?.display_name || profile?.name || shortenPubkey(pubkey)}
      </Text>
    </HStack>
  );
  return url ? <Link href={url}>{component}</Link> : component;
}
