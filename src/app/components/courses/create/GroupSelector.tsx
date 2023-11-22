import { Flex, Heading, TextField } from "@radix-ui/themes";

export default function GroupSelector() {
  return (
    <Flex direction={"column"} gap="2">
      <Heading size="5">Give your course a name</Heading>
      <TextField.Root>
        <TextField.Input placeholder="Ruy Lopez: For white" size={"3"} />
      </TextField.Root>
    </Flex>
  );
}
