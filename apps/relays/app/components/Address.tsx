"use client";

import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import {
  Stack,
  HStack,
  Heading,
  Alert,
  AlertIcon,
  Skeleton,
} from "@chakra-ui/react";
import { NDKKind, NDKEvent } from "@nostr-dev-kit/ndk";
import { useEvent, User, Event } from "@ngine/core";

import RelaysFeed from "./relays-feed";
import RelayLink from "./relay-link";
import { tagToRelay } from "../utils";

function RelaySet({ event }: { event: NDKEvent }) {
  const title = useMemo(() => event.tagValue("title"), [event]);
  const relays = useMemo(() => {
    return event.tags.filter((t) => t[0] === "relay").map(tagToRelay);
  }, [event]);
  return relays.length > 0 ? (
    <Stack gap={4}>
      <HStack justify="space-between">
        <Heading>
          {title || (
            <FormattedMessage
              id="relay-set"
              description="Relay Set title"
              defaultMessage="Relay Set"
            />
          )}
        </Heading>
        <User pubkey={event.pubkey} size="xs" fontSize="sm" />
      </HStack>
      <Stack>
        {relays.map((r) => (
          <RelayLink key={r.url} url={r.url} />
        ))}
      </Stack>
      <RelaysFeed relays={relays.map((r) => r.url)} />
    </Stack>
  ) : (
    <Alert status="error">
      <AlertIcon />
      <FormattedMessage
        id="bad-relayset"
        description="Error message when a relay set does not have relay URLs"
        defaultMessage="This relay set does not contain relay URLs"
      />
    </Alert>
  );
}

interface AddressProps {
  kind: number;
  pubkey: string;
  identifier: string;
  relays?: string[];
}

export default function Address({
  kind,
  pubkey,
  identifier,
  relays,
}: AddressProps) {
  const event = useEvent(
    {
      kinds: [kind],
      authors: [pubkey],
      "#d": [identifier],
    },
    {},
    relays,
  );

  return event ? (
    <Event event={event} components={{ [NDKKind.RelaySet]: RelaySet }} />
  ) : (
    <Skeleton height="21px" />
  );
}
