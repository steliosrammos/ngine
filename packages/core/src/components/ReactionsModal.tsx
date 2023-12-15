import { ReactNode } from "react";
import {
  HStack,
  Icon,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { FormattedMessage } from "react-intl";

import Amount from "./Amount";
import User from "./User";
import { Repost as RepostIcon, Heart } from "../icons";
import { ZapRequest } from "../nostr/nip57";
import { EventProps } from "../types";
import { ReactionEvents } from "../hooks/useReactions";

function Zap({ zap }: { zap: ZapRequest }) {
  return (
    <HStack justifyContent="space-between">
      <User pubkey={zap.pubkey} />
      <Text fontSize="lg" fontWeight={600}>
        <Amount amount={zap.amount} />
      </Text>
    </HStack>
  );
}

function Like({ event }: EventProps) {
  const emoji = event.content;
  const customEmoji = event?.tags.find(
    (t) =>
      emoji &&
      t[0] === "emoji" &&
      t[1] === `${emoji.slice(1, emoji?.length - 1)}`,
  );
  return (
    <HStack justifyContent="space-between">
      <User pubkey={event.pubkey} />
      {customEmoji ? (
        <Image boxSize={5} src={customEmoji[2]} />
      ) : !["+", "-"].includes(emoji) ? (
        <Text fontSize="lg">{emoji}</Text>
      ) : (
        <Icon as={Heart} boxSize={5} />
      )}
    </HStack>
  );
}

function Repost({ event }: EventProps) {
  return (
    <HStack justifyContent="space-between">
      <User pubkey={event.pubkey} />
      <Icon as={RepostIcon} boxSize={5} />
    </HStack>
  );
}

function ReactionsList({ children }: { children: ReactNode }) {
  return (
    <Stack
      h="210px"
      sx={{
        overflowY: "scroll",
        flexWrap: "nowrap",
        scrollbarWidth: "none",
        "-webkit-overflow-scrolling": "touch",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {children}
    </Stack>
  );
}

interface ReactionsModalProps {
  isOpen: boolean;
  onClose(): void;
  kinds: NDKKind[];
  events: ReactionEvents;
}

export default function ReactionsModal({
  isOpen,
  events,
  kinds,
  onClose,
}: ReactionsModalProps) {
  const { zaps, reposts, reactions } = events;
  const { zapRequests } = zaps;
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <FormattedMessage
            id="ngine.reactions-count"
            description="Reactions modal title"
            defaultMessage="Reactions ({ count })"
            values={{ count: events.events.length }}
          />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs variant="soft-rounded" colorScheme="brand">
            <TabList>
              {kinds.map((k) => {
                if (k === NDKKind.Zap) {
                  return (
                    <Tab key={`${k}-tab`}>
                      <FormattedMessage
                        id="ngine.zaps-count"
                        description="Zap count"
                        defaultMessage="Zaps ({ count })"
                        values={{ count: zapRequests.length }}
                      />
                    </Tab>
                  );
                }
                if (k === NDKKind.Reaction) {
                  return (
                    <Tab key={`${k}-tab`}>
                      <FormattedMessage
                        id="ngine.likes-count"
                        description="Likes count"
                        defaultMessage="Likes ({ count })"
                        values={{ count: reactions.length }}
                      />
                    </Tab>
                  );
                }
                if (k === NDKKind.Repost || k === NDKKind.GenericRepost) {
                  return (
                    <Tab key={`${k}-tab`}>
                      <FormattedMessage
                        id="ngine.reposts-count"
                        description="Reposts count"
                        defaultMessage="Reposts ({ count })"
                        values={{ count: reposts.length }}
                      />
                    </Tab>
                  );
                }
                return null;
              })}
            </TabList>

            <TabPanels>
              {kinds.map((k) => {
                if (k === NDKKind.Zap) {
                  return (
                    <TabPanel key={k}>
                      <ReactionsList>
                        {zapRequests.map((z) => (
                          <Zap key={z.id} zap={z} />
                        ))}
                      </ReactionsList>
                    </TabPanel>
                  );
                }
                if (k === NDKKind.Repost || k === NDKKind.GenericRepost) {
                  return (
                    <TabPanel key={k}>
                      <ReactionsList>
                        {reposts.map((e) => (
                          <Repost key={e.id} event={e} />
                        ))}
                      </ReactionsList>
                    </TabPanel>
                  );
                }
                if (k === NDKKind.Reaction) {
                  return (
                    <TabPanel key={k}>
                      <ReactionsList>
                        {reactions.map((e) => (
                          <Like key={e.id} event={e} />
                        ))}
                      </ReactionsList>
                    </TabPanel>
                  );
                }
                return null;
              })}
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
