/*********************************************************************
 * Useless Gaps is Copyright (C) 2021-2024 Pim Snel
 *
 * Useless Gaps is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation
 *
 * Useless Gaps is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Useless Gaps.  If not, see <http://www.gnu.org/licenses/>.
 **********************************************************************/

// import GObject from 'gi://GObject';
// import Gio from 'gi://Gio';
// import Gtk from 'gi://Gtk';
// import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
// import * as UI from './ui.js'

// export default class UselessGapsPrefs extends ExtensionPreferences {

//   getPreferencesWidget() {
//     const settings = this.getSettings();
//     const widget = new UselessGapsPrefsWidget(settings);
//     return widget;
//   }
// }

// const UselessGapsPrefsWidget = new GObject.Class({
//   Name: 'Shortcuts.Prefs.Widget',
//   GTypeName: 'UselessGapsPrefsWidget',
//   Extends: Gtk.ScrolledWindow,

//    _init: function(settings) {

//     this.parent(
//       {
//         valign: Gtk.Align.FILL,
//         vexpand: true
//       }
//     );

//     this._settings = settings;

//     this.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);

//     this._grid = new UI.ListGrid();

//     this.set_child(new UI.Frame(this._grid));

//     let mainSettingsLabel = new UI.LargeLabel("Main Settings");
//     this._grid._add(mainSettingsLabel)

//     this._spinGapsize = new Gtk.SpinButton;
//     this._spinGapsize.set_range(0, 300);
//     this._spinGapsize.set_increments(1, 1);

//     let label_gapsize = new UI.Label('Gap Size')
//     this._grid._add(label_gapsize, this._spinGapsize);

//     this._settings.bind("gap-size", this._spinGapsize, "value", Gio.SettingsBindFlags.DEFAULT);

//     let noGapsForMaximizedWindowsCheckBox = new UI.Check("No gaps for maximized windows");
//     this._settings.bind('no-gap-when-maximized', noGapsForMaximizedWindowsCheckBox, 'active', Gio.SettingsBindFlags.DEFAULT);
//     this._grid._add(noGapsForMaximizedWindowsCheckBox);

//     this._spinMarginTop = new Gtk.SpinButton;
//     this._spinMarginTop.set_range(0, 300);
//     this._spinMarginTop.set_increments(1, 1);

//     let label_margin_top = new UI.Label('Extra margin top')
//     this._grid._add(label_margin_top, this._spinMarginTop);

//     this._settings.bind("margin-top", this._spinMarginTop, "value", Gio.SettingsBindFlags.DEFAULT);

//     this._spinMarginBottom = new Gtk.SpinButton;
//     this._spinMarginBottom.set_range(0, 300);
//     this._spinMarginBottom.set_increments(1, 1);

//     let label_margin_bottom = new UI.Label('Extra margin bottom')
//     this._grid._add(label_margin_bottom, this._spinMarginBottom);

//     this._settings.bind("margin-bottom", this._spinMarginBottom, "value", Gio.SettingsBindFlags.DEFAULT);

//     this._spinMarginLeft = new Gtk.SpinButton;
//     this._spinMarginLeft.set_range(0, 300);
//     this._spinMarginLeft.set_increments(1, 1);

//     let label_margin_left = new UI.Label('Extra margin left')
//     this._grid._add(label_margin_left, this._spinMarginLeft);

//     this._settings.bind("margin-left", this._spinMarginLeft, "value", Gio.SettingsBindFlags.DEFAULT);

//     this._spinMarginRight = new Gtk.SpinButton;
//     this._spinMarginRight.set_range(0, 300);
//     this._spinMarginRight.set_increments(1, 1);

//     let label_margin_right = new UI.Label('Extra margin right')
//     this._grid._add(label_margin_right, this._spinMarginRight);

//     this._settings.bind("margin-right", this._spinMarginRight, "value", Gio.SettingsBindFlags.DEFAULT);
//   }
// });


//Main imports
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';

//Extension system imports
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

var PrefsPage = GObject.registerClass(
class PrefsPage extends Adw.PreferencesPage {
  _init(pageInfo, groupsInfo, settingsInfo, settings) {
    super._init({
      title: pageInfo[0],
      icon_name: pageInfo[1]
    });

    this._extensionSettings = settings;
    this._settingGroups = {};

    //Setup settings
    this._createGroups(groupsInfo);
    this._createSettings(settingsInfo);
  }

  _createGroups(groupsInfo) {
    //Store groups, set title and add to window
    groupsInfo.forEach((groupInfo) => {
      this._settingGroups[groupInfo[0]] = new Adw.PreferencesGroup();
      this._settingGroups[groupInfo[0]].set_title(groupInfo[1]);
      this._settingGroups[groupInfo[0]].set_description(groupInfo[2] || null);
      this.add(this._settingGroups[groupInfo[0]]);
    });
  }

  _createSettings(settingsInfo) {
    settingsInfo.forEach(settingInfo => {
      //Check the target group exists
      if (!(settingInfo[0] in this._settingGroups)) {
        return;
      }

      //Handle type-specific setup
      let settingRow = null;
      if (settingInfo[1] === 'spin') {
        //Create a row with a switch, title and subtitle
        settingRow = new Adw.SpinRow({
          title: settingInfo[3],
          subtitle: settingInfo[4],
          adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 300,
            step_increment: 1,
            page_increment: 10,
            page_size: 0
          })
        });

        //Connect the row's element to the setting
        this._extensionSettings.bind(
          settingInfo[2], //GSettings key to bind to
          settingRow, //Object to bind to
          'value', //The property to share
          Gio.SettingsBindFlags.DEFAULT
        );

      } else if (settingInfo[1] === 'switch') {
        //Create a row with a switch, title and subtitle
        settingRow = new Adw.SwitchRow({
          title: settingInfo[3],
          subtitle: settingInfo[4]
        });

        //Connect the row's element to the setting
        this._extensionSettings.bind(
          settingInfo[2], //GSettings key to bind to
          settingRow, //Object to bind to
          'active', //The property to share
          Gio.SettingsBindFlags.DEFAULT
        );
      } else if (settingInfo[1] === 'select') {
        //Store the options for the setting
        let stringList = new Gtk.StringList();
        settingInfo[5].forEach((entry) => {
          stringList.append(entry[1]);
        });

        //Create a row with a combo box, title and subtitle
        settingRow = new Adw.ComboRow({
          title: settingInfo[3],
          subtitle: settingInfo[4],
          model: stringList
        });
        settingRow._dropdownData = [...settingInfo[5]];
        settingRow._settingKey = settingInfo[2];

        settingRow.connect('notify::selected-item', (row) => {
          let index = row.get_selected();
          let value = row._dropdownData[index][0];
          this._extensionSettings.set_string(row._settingKey, value);
        });
      }

      //Add the row to the group
      this._settingGroups[settingInfo[0]].add(settingRow);
    });
  }
});

export default class UselessGapsPrefs extends ExtensionPreferences {
  //Create preferences window with libadwaita
  fillPreferencesWindow(window) {
    //Translated title, icon name
    let pageInfo = [_('Settings'), 'preferences-system-symbolic'];

    let groupsInfo = [
      //Group ID, translated title, subtitle
      ['general', _('General settings'), null],
      ['advanced', _('Advanced settings'), _('Additional configuration options')]
    ];

    let settingsInfo = [
      //Group ID, type, setting key, title, subtitle, extra data
      ['general', 'spin', 'gap-size', _('Gap size'), _('Size of the gaps between windows'), null],
      ['general', 'switch', 'no-gap-when-maximized', _('No gaps for maximized windows'), _('Disable gaps when a window is maximized'), null],
      ['advanced', 'spin', 'margin-top', _('Extra margin top'), _('Additional margin added to the top of the screen'), null],
      ['advanced', 'spin', 'margin-bottom', _('Extra margin bottom'), _('Additional margin added to the bottom of the screen'), null],
      ['advanced', 'spin', 'margin-left', _('Extra margin left'), _('Additional margin added to the left of the screen'), null],
      ['advanced', 'spin', 'margin-right', _('Extra margin right'), _('Additional margin added to the right of the screen'), null]
    ];

    //Create settings page from info
    let settingsPage = new PrefsPage(pageInfo, groupsInfo, settingsInfo, this.getSettings());

    //Add the pages to the window, enable searching
    window.add(settingsPage);
    window.set_search_enabled(true);
  }
}