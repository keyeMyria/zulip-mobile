# Push notifications

This doc describes how to test and develop changes to Zulip's mobile
push notifications.


## General tips

When testing Zulip's push notifications:

* Try simulating a PM conversation between two users: one on the
  mobile device, and one from your desktop.  For example, if you've
  logged in as "Iago" on your mobile device, log in as "Polonius" via
  a web browser, and send a PM from Polonius to Iago.

* Test different types of messages that will cause different types of
  notifications: a 1:1 PM conversation, a group PM conversation, an
  @-mention in a stream, a stream with notifications turned on, even
  an @-mention in a 1:1 or group PM conversation.

* Make sure "mobile push notifications" are on in the mobile user's
  Zulip settings!

  * Try also turning on the "even while online" setting -- this is
    extremely helpful for testing notifications effectively, with
    basically the one exception of if you're specifically working on
    the "if online" aspect of the system.

* Make sure notifications are enabled for Zulip in the device's system
  settings!

  * To get to these, find "Notifications" or "Apps & Notifications" in
    the system settings app, depending on OS and version; then find
    Zulip in the list.  Or on Android, in the launcher give the app's
    icon a long-press -> "App Info" -> "Notifications".

  * Also check the settings there for whether and how the app's
    notifications will pop on the screen, make a sound, etc.

  * Particularly for the debug build on one's personal device, it's
    natural to disable notifications between development sessions to
    suppress duplicates... then forget to re-enable them.

* Leave the app in the background: that is, switch to the launcher /
  home screen or to a different app to get it off the screen.  Or
  keep it on screen, or force-kill it, to test different scenarios!


## Testing server-side changes (iOS or Android)

When making changes to the Zulip server, use these steps to test how
they affect notifications.

First, three one-time setup steps:

1. [Set up the dev server for mobile development](dev-server.md).

2. Add the following line to `zproject/dev_settings.py`:

   ```python
   PUSH_NOTIFICATION_BOUNCER_URL = 'https://push.zulipchat.com'
   ```

   This matches the default setting for a production install of the
   Zulip server (generated from `zproject/prod_settings_template.py`.)

   You can keep this around via `git stash`.

3. Register your development server with our production bouncer by
   running the following command:

   ```
   python manage.py register_server --agree_to_terms_of_service
   ```

   This is a variation of our [instructions for production
   deployments](https://zulip.readthedocs.io/en/latest/production/mobile-push-notifications.html),
   adapted for the Zulip dev environment.

   You should only have to do this step once, unless you build a new
   Zulip server dev environment from scratch.  The credentials which
   this command registers with the bouncer are kept in the
   `zproject/dev-secrets.conf` file.

   If you were already running `tools/run-dev.py`, quit and restart it
   after these setup steps.


Then, each time you test:

1. Run `tools/run-dev.py` according to the instructions in
   [dev-server.md](dev-server.md).  Then follow that doc's
   instructions to log into the dev server.  Use the release build of
   the app -- that is, the Zulip app installed from the App Store or
   Play Store.

2. Follow the general tips above to cause a push notification.  For
   example, log in from a browser as a different user, and send the
   mobile user a PM.

   You should see a push notification appear on the mobile device!

   If you don't, check the general tips above.  Then ask in chat and
   let's debug.


## Testing client-side changes on Android

Happily, this is straightforward: just edit, build, and run the app
the same as for any other change.

Typically you'll be editing Java code (not only JS), so remember to
rerun `react-native run-android`.

### Debugging tips (for Android client)

Our notifications code tags log messages with the tag `ZulipNotif`.
So a command like `adb logcat ZulipNotif:V *:E` is helpful for seeing
details about Zulip notifications.  For example (edited slightly for
readability):

```
$ adb logcat -T 1000 ZulipNotif:V *:E
V ZulipNotif: getPushNotification: Bundle[{google.delivered_priority=normal,
    sender_full_name=Othello, the Moor of Venice, google.sent_time=1541205694753, google.ttl=2419200,
    google.original_priority=normal, sender_avatar_url=https://secure.gravatar.com/avatar/23f3blah,
    server=10.10.116.251:9991, realm_uri=http://10.10.116.251:9991, realm_id=1, content_truncated=false,
    zulip_message_id=108, recipient_type=private, time=1541205694, user=hamlet@zulip.com, sender_id=6,
    alert=New private message from Othello, the Moor of Venice, event=message,
    google.message_id=0:1541205694760139%d08e4852f9fd7ecd, content=hi, sender_email=othello@zulip.com}]
V ZulipNotif: java.lang.Throwable
V ZulipNotif: 	at com.zulipmobile.MainApplication.getPushNotification(MainApplication.java:86)
V ZulipNotif: 	at com.wix.reactnativenotifications.core.notification.PushNotification.get(PushNotification.java:45)
V ZulipNotif: 	at com.wix.reactnativenotifications.gcm.GcmMessageHandlerService.onMessageReceived(GcmMessageHandlerService.java:19)
V ZulipNotif: 	at com.google.android.gms.gcm.GcmListenerService.handleIntent(Unknown Source:409)
V ZulipNotif: 	at com.google.android.gms.iid.zzj.run(Unknown Source:26)
V ZulipNotif: 	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1167)
V ZulipNotif: 	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:641)
V ZulipNotif: 	at java.lang.Thread.run(Thread.java:764)
```

The spew in this example is from this line in our code:
```
    Log.v(NotificationHelper.TAG, "getPushNotification: " + bundle.toString(), new Throwable());
```
(The stack trace is just for information; it doesn't represent an
error.)

You can do print-debugging by adding similar lines, even if they don't
make it into the final code you send in a PR.  Here's another example:
```
    Log.v(TAG, String.format("update: %d", conversations.size()));
```


## Testing client-side changes on iOS

The Apple Push Notification service (APNs) does not allow our production
bouncer to send notifications to a development build of the Zulip Mobile
app.

(Work in progress; given an appropriate dev certificate, we should be able
to send notifications to a dev build of the app through Apple's sandbox
instance of APNs.)
