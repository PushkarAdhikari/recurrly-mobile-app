import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useClerk, useUser } from '@clerk/expo';
import dayjs from "dayjs";
import { styled } from "nativewind";
import React from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView)
export default function App() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const [expendedSubscriptionId, setExpandedSubscriptionId] = React.useState<string | null>(null);

  const userName = user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] || 'User'

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="home-avatar" />
                <Text className="home-user-name">{userName}</Text>
              </View>
              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date"> {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM/DD")}</Text>
              </View>
            </View>

            <View>
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <Text className="home-empty-state">No upcoming renewals yet.</Text>
                )}
              />
            </View>


            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard {...item}
            expanded={expendedSubscriptionId === item.id}
            onPress={() => setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
          />
        )}

        extraData={expendedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}

        ListEmptyComponent={() => (
          <Text className="home-empty-state">No subscriptions yet.</Text>
        )}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}