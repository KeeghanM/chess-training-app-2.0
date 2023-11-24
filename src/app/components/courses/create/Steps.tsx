import { Box, Flex, Text } from "@radix-ui/themes";
import NumberIcon from "~/app/components/general/NumberIcon";

export default function Steps(props: { currentStep: string }) {
  const { currentStep } = props;

  return (
    <Box width={"max-content"} mx={"auto"} my={"4"}>
      <Flex gap="4" align="center" mx={"auto"}>
        <Flex gap="1" align="center">
          <NumberIcon
            number={1}
            color={
              currentStep == "name" ? "var(--plum-9)" : "rgba(255,255,255,0.5)"
            }
          />
          <Text size="1">Name & Details</Text>
        </Flex>
        <Flex gap="1" align="center">
          <NumberIcon
            number={2}
            color={
              currentStep == "import"
                ? "var(--plum-9)"
                : "rgba(255,255,255,0.5)"
            }
          />
          <Text size="1">Import PGN</Text>
        </Flex>
        <Flex gap="1" align="center">
          <NumberIcon
            number={3}
            color={
              currentStep == "group" ? "var(--plum-9)" : "rgba(255,255,255,0.5)"
            }
          />
          <Text size="1">Select Grouping</Text>
        </Flex>
      </Flex>
    </Box>
  );
}
