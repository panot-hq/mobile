import ContactInteractionItem from "@/components/contacts/ContactInteractionItem";
import Badge from "@/components/ui/Badge";
import { Interaction } from "@/lib/database/database.types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";

interface ContactInteractionTimelineProps {
  interactions: Interaction[];
}

export default function ContactInteractionTimeline({
  interactions,
}: ContactInteractionTimelineProps) {
  const groupedInteractions = interactions.reduce((groups, interaction) => {
    const date = new Date(interaction.created_at);
    const dateKey = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(interaction);
    return groups;
  }, {} as Record<string, typeof interactions>);

  const sortedDateKeys = Object.keys(groupedInteractions).sort((a, b) => {
    const dateA = new Date(groupedInteractions[a][0].created_at).getTime();
    const dateB = new Date(groupedInteractions[b][0].created_at).getTime();
    return dateB - dateA;
  });

  sortedDateKeys.forEach((dateKey) => {
    groupedInteractions[dateKey].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  });

  if (interactions.length === 0) {
    return (
      <>
        <Badge
          title="timeline"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={15}
        />
        <Text
          style={{
            color: "#ccc",
            fontSize: 12,
            textAlign: "center",

            marginTop: 30,
          }}
        >
          No interactions yet, go on and start connecting!
        </Text>
      </>
    );
  }

  return (
    <View>
      <Badge
        title="timeline"
        color="#E9E9E9"
        textColor="#000"
        textSize={14}
        marginBottom={15}
      />
      <View style={{ marginBottom: 130, marginTop: 15 }}>
        {sortedDateKeys.map((dateKey, groupIndex) => {
          const dayInteractions = groupedInteractions[dateKey];
          const isFirstGroup = groupIndex === 0;
          const isLastGroup = groupIndex === sortedDateKeys.length - 1;

          const today = new Date();
          const todayKey = today.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const isToday = dateKey === todayKey;
          const displayDate = isToday ? "Today" : dateKey;

          return (
            <View key={dateKey}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: isFirstGroup ? 0 : 20,
                  marginBottom: 12,
                  paddingLeft: 17,
                }}
              >
                <FontAwesome
                  name="circle"
                  size={8}
                  color="#ddd"
                  style={{ marginRight: 18 }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "400",
                    color: "#666",
                  }}
                >
                  {displayDate}
                </Text>
              </View>

              {dayInteractions.map((interaction, index) => (
                <ContactInteractionItem
                  key={interaction.id}
                  interaction={interaction}
                  isFirst={false}
                  isLast={isLastGroup && index === dayInteractions.length - 1}
                />
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}
