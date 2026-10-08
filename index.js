import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { registerRootComponent } from 'expo';
import App from './App';
import { widgetTaskHandler } from './src/widgets/android/widget-task-handler';
import { WorkTimeWidget } from './src/widgets/android/WorkTimeWidget';

// ثبت هندلر برای ویجت
registerWidgetTaskHandler(widgetTaskHandler);

// ثبت خود ویجت (این قسمت رو باید با کدهای خودتون ادغام کنید)
import { registerWidget } from 'react-native-android-widget';
registerWidget('WorkTimeWidget', WorkTimeWidget);

// ثبت اپلیکیشن اصلی
registerRootComponent(App);