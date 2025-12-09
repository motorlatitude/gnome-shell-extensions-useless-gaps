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
        //Create a row with a SpinRow, title and subtitle
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
      ['general', _('General'), null],
      ['advanced', _('Advanced'), _('Additional configuration options')]
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

    //Add the pages to the window
    window.add(settingsPage);
  }
}