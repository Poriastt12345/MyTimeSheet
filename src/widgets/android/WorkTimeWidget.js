import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export function WorkTimeWidget() {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 8,
      }}
    >
      {/* ردیف اول: شروع و پایان کار */}
      <FlexWidget style={{ flexDirection: "row", width: "match_parent", justifyContent: "space-around" }}>
        <TextWidget
          clickAction="START_WORK"
          text="شروع کار"
          style={{ fontSize: 14, color: "#007AFF", padding: 10, backgroundColor: "#E5F0FF", borderRadius: 8 }}
        />
        <TextWidget
          clickAction="END_WORK"
          text="پایان کار"
          style={{ fontSize: 14, color: "#FF3B30", padding: 10, backgroundColor: "#FFE5E5", borderRadius: 8 }}
        />
      </FlexWidget>

      {/* ردیف دوم: شروع و پایان ماموریت */}
      <FlexWidget style={{ flexDirection: "row", width: "match_parent", justifyContent: "space-around", marginTop: 8 }}>
        <TextWidget
          clickAction="START_MISSION"
          text="شروع ماموریت"
          style={{ fontSize: 14, color: "#FF9500", padding: 10, backgroundColor: "#FFF5E5", borderRadius: 8 }}
        />
        <TextWidget
          clickAction="END_MISSION"
          text="پایان ماموریت"
          style={{ fontSize: 14, color: "#34C759", padding: 10, backgroundColor: "#E5FFE5", borderRadius: 8 }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}