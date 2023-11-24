import { Flex, Text } from "@radix-ui/themes";
import { Line } from "~/app/components/courses/create/parse/ParsePGNtoLineData";

export default function PrettyPrintLine(line: Line) {
  // Return the moves, with the move number bolded
  // and each move "set" (i.e one white one black) wrapped in a <p> tag
  // each move, and move number, needs separating by a space

  const movePairs: { whiteMove: string; blackMove: string }[] = [];
  for (let i = 0; i < line.moves.length; i += 2) {
    movePairs.push({
      whiteMove: line.moves[i]?.notation || "",
      blackMove: line.moves[i + 1]?.notation || "",
    });
  }

  return (
    <Flex align={"center"} gap={"2"} wrap={"wrap"}>
      {movePairs.map((pair, index) => (
        <Flex align={"center"} gap={"1"}>
          <Text weight={"bold"}>{index + 1}.</Text>
          {pair.whiteMove && <Text>{pair.whiteMove}</Text>}
          {pair.blackMove && <Text>{pair.blackMove}</Text>}
        </Flex>
      ))}
    </Flex>
  );
}
