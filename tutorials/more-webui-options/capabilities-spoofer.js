// The proxyRequest and proxyResponse functions will be called for all requests  and responses made via ZAP, 
// excluding some of the automated tools
// If they return 'false' then the corresponding request / response will be dropped. 
// You can use msg.setForceIntercept(true) in either method to force a breakpoint

// Note that new proxy scripts will initially be disabled
// Right click the script in the Scripts tree and select "enable"  

/**
 * This function allows interaction with proxy requests (i.e.: outbound from the browser/client to the server).
 * 
 * @param msg - the HTTP request being proxied. This is an HttpMessage object.
 */
function proxyRequest(msg) {
	// Debugging can be done using println like this
	print('proxyRequest called for url=' + msg.getRequestHeader().getURI().toString())
	
	return true
}

/**
 * This function allows interaction with proxy responses (i.e.: inbound from the server to the browser/client).
 * 
 * @param msg - the HTTP response being proxied. This is an HttpMessage object.
 */
function proxyResponse(msg) {
    // Check if the requested URI contains the target CGI script
    var uri = msg.getRequestHeader().getURI().toString();
    
    if (uri.indexOf("capabilities_status_web_app.cgi") !== -1) {
        
        // 1. Define your custom JSON response payload
        var customJson = JSON.stringify(

{
  "AdminUserData": {
    "authorizedcgi": [
      "wan_internet_status_web_app.cgi",
      "dashboard_status_web_app.cgi",
      "overview_status_web_app.cgi?cache",
      "overview_status_web_app.cgi?nocache",
      "dashboard_device_status_web_app.cgi",
      "dashboard_ntwtopo_status_web_app.cgi",
      "device_status_web_app.cgi?rootalias",
      "device_status_web_app.cgi?getroot",
      "device_home_network_status_web_app.cgi",
      "device_home_nw_client_status_web_app.cgi",
      "ledctrl_status_web_app.cgi",
      "ledctrl_web_app.cgi?SetLedGlb",
      "domain_route_status_web_app.cgi",
      "domain_route_web_app.cgi?add_domainRouteData",
      "domain_route_web_app.cgi?act=del",
      "domain_route_web_app.cgi?enable",
      "radio_receiver_status_web_app.cgi",
      "lan_status_web_app.cgi",
      "lan_status_web_app.cgi?lan",
      "show_wan_status_web_app.cgi",
      "show_wan_status_web_app.cgi?ipv4",
      "show_wan_status_web_app.cgi?ipv6",
      "lan_status_web_app.cgi?wlan",
      "lan_status_web_app.cgi?add_client_alias",
      "lan_status_web_app.cgi?del",
      "lan_status_web_app.cgi?delDom",
      "statistics_status_web_app.cgi",
      "neighboring_AP_web_app.cgi",
      "pon_status_web_app.cgi",
      "lan_ipv4_status_web_app.cgi",
      "lan_ipv6_status_web_app.cgi",
      "wan_config_glb_status_web_app.cgi",
      "wan_config_glb_r_web_app.cgi?config",
      "wan_dhcp_web_app.cgi?config",
      "wan_dhcp_status_web_app.cgi",
      "wlan_config_web_app.cgi?do_config_glb",
      "wlan_config_web_app.cgi?do_config_glb11ac",
      "wlan_config_web_app.cgi?wps_status",
      "wlan_config_web_app.cgi?pin_get",
      "wlan_config_web_app.cgi?wps_pin_status_glb11ac",
      "wlan_config_web_app.cgi?act=11ac_pin_get",
      "wlan_config_web_app.cgi?pbc_glb11ac",
      "wlan_config_web_app.cgi?sta_pin_glb11ac",
      "wlan_config_web_app.cgi?ap_pin_glb11ac",
      "wlan_config_web_app.cgi?sta_pin",
      "wlan_config_web_app.cgi?ap_pin",
      "wlan_config_web_app.cgi?pbc",
      "wlan_config_web_app.cgi?wps_pin_status_glb11ac",
      "wlan_config_web_app.cgi?pbc_glb11ac",
      "wlan_config_web_app.cgi?do_config_glb11ac",
      "wlan_config_status_web_app.cgi",
      "wlan_config_web_app.cgi?OptimizeNetwork",
      "wlan_config_status_web_app.cgi?v=11ac",
      "wlan_config_guest_status_web_app.cgi",
      "wlan_config_guest_web_app.cgi?ConfigWhwGuest",
      "wlan_config_status_web_app.cgi?v=11ac_highband",
      "wlan_config_web_app.cgi?do_config_glb11ac_highband",
      "wlan_config_web_app.cgi?pbc_glb11ac_highband",
      "wlan_config_web_app.cgi?ap_pin_glb11ac_highband",
      "wlan_config_web_app.cgi?sta_pin_glb11ac_highband",
      "wlan_config_web_app.cgi?wps_pin_status_glb11ac_highband",
      "wlan_config_web_app.cgi?act=11ac_pin_get_highband",
      "qos_web_app.cgi?v=del_gfast",
      "qos_web_app.cgi?v=add",
      "qos_status_web_app.cgi",
      "mesh_web_app.cgi?add",
      "mesh_web_app.cgi?del",
      "mesh_web_app.cgi?v_glb=set",
      "mesh_status_web_app.cgi",
      "whw_beacon_mode_app_status_web_app.cgi?getWorkMode",
      "whw_beacon_mode_app_web_app.cgi",
      "password_web_app.cgi?set",
      "password_web_app.cgi?savedb",
      "password_status_web_app.cgi",
      "device_name_web_app.cgi?add",
      "device_name_web_app.cgi?act=del",
      "device_name_status_web_app.cgi",
      "usb_web_app.cgi?import",
      "usb_web_app.cgi?v=import",
      "usb_web_app.cgi?export",
      "reboot_web_app.cgi",
      "restore_web_app.cgi?restore_glb",
      "restore_web_app.cgi?deep_factory",
      "diag_web_app.cgi?ping",
      "diag_web_app.cgi?cancel",
      "diag_status_web_app.cgi",
      "command_web_app.cgi?cat",
      "command_web_app.cgi?pexist",
      "log_web_app.cgi?set_log_glb",
      "log_status_web_app.cgi?info",
      "log_status_web_app.cgi?vlog_glb",
      "troubleshooting_web_app.cgi?ping",
      "troubleshooting_web_app.cgi?usthroughputtest",
      "troubleshooting_web_app.cgi?dsthroughputtest",
      "troubleshooting_web_app.cgi?uspacketloss",
      "troubleshooting_web_app.cgi?dspacketloss",
      "troubleshooting_web_app.cgi?latencytest",
      "troubleshooting_web_app.cgi?dnsrestest",
      "troubleshooting_status_web_app.cgi",
      "nat_glb_status_web_app.cgi?v=vhost",
      "nat_glb_web_app.cgi?v=add_vhost",
      "nat_glb_web_app.cgi?v=del_vhost",
      "nat_glb_web_app.cgi?v=add_thost",
      "nat_glb_status_web_app.cgi?v=thost",
      "nat_glb_web_app.cgi?v=del_thost",
      "nat_glb_status_web_app.cgi",
      "ddns_web_app.cgi?add_glb",
      "ddns_status_web_app.cgi",
      "sntp_status_web_app.cgi",
      "upnp_web_app.cgi?config_glb",
      "upnp_status_web_app.cgi",
      "firewall_web_app.cgi?fire",
      "firewall_web_app.cgi?level_name",
      "firewall_status_web_app.cgi?fire",
      "macfilter_web_app.cgi?add_ethernet",
      "macfilter_web_app.cgi?act=del_ethernet",
      "macfilter_web_app.cgi?add_wlan",
      "macfilter_web_app.cgi?act=del_wlan",
      "macfilter_status_web_app.cgi",
      "ipfilter_web_app.cgi?v_glb=setfilter",
      "ipfilter_web_app.cgi?v_glb=set",
      "ipfilter_web_app.cgi?add_glb",
      "ipfilter_web_app.cgi?v_glb=delip",
      "ipfilter_status_web_app.cgi",
      "nat_glb_web_app.cgi?v=cfg_alg",
      "nat_glb_status_web_app.cgi?v=alg",
      "nat_glb_web_app.cgi?v=cfg_dmz",
      "nat_glb_status_web_app.cgi",
      "parental_ctrl_status_web_app.cgi",
      "parental_ctrl_web_app.cgi",
      "container_management_status_web_app.cgi",
      "tr69_web_app.cgi?set_glb",
      "tr69_status_web_app.cgi"
    ],
    "homeGateway": {
      "visibility": 1,
      "model": "",
      "logout": 1,
      "copyright": 1,
      "recommendedBrowsers": 1,
      "chooseLanguage": {
        "visibility": 1,
        "fields": [
          {
            "visibility": 1,
            "label": "English",
            "value": "en",
            "key": "en"
          },
          {
            "visibility": 1,
            "label": "Polski",
            "value": "pl_PL",
            "key": "pl"
          },
          {
            "visibility": 1,
            "label": "Français",
            "value": "fr_CA",
            "key": "fr"
          },
          {
            "visibility": 1,
            "label": "日本",
            "value": "ja_JP",
            "key": "jp"
          },
          {
            "visibility": 1,
            "label": "Türkçe",
            "value": "tr_TR",
            "key": "tr"
          },
          {
            "visibility": 1,
            "label": "Español",
            "value": "es_MX",
            "key": "es"
          },
          {
            "visibility": 1,
            "label": "عربي",
            "value": "ar",
            "key": "ar"
          }
        ]
      }
    },
    "overview": {
      "visibility": 1,
      "refreshButton": 1,
      "serviceStatus": {
        "visibility": 1,
        "wanIp": 1,
        "internet": 1,
        "wifi": 1,
        "voiceInformation": 1
      },
      "networkMap": {
        "visibility": 1,
        "addWifiButton": {
          "visibility": 1
        }
      },
      "connectedClients": {
        "visibility": 1
      },
      "wifiNetworks": {
        "visibility": 1
      },
      "laninterfaceStatus": {
        "visibility": 1
      },
      "radioAccess": {
        "visibility": 1,
        "receiverButton": 1
      }
    },
    "wan": {
      "visibility": 1,
      "wanServices": {
        "overview": 1,
        "addButton": 1,
        "visibility": 1,
        "refreshButton": 1,
        "wanConnectionList": 1,
        "connectionType": 1,
        "connectionMode": 1,
        "ipMode": {
          "visibility": 1,
          "ipv4": 1,
          "ipv6": 1,
          "ipv4&ipv6": 1,
          "ipv6hostOnly": 1
        },
        "wanEnabled": 1,
        "nat": 1,
        "tr169": 1,
        "voip": 1,
        "internet": 1,
        "iptv": 1,
        "multicastVlan": 1,
        "enableVlan": 1,
        "vlanId": 1,
        "vlanPri": 1,
        "wanIpMode": 1,
        "addressMethod": 1,
        "enablePrefixDelegation": 1,
        "prefixType": 1,
        "username": 1,
        "password": 1,
        "keepAliveTime": 1,
        "keepAliveRetry": 1,
        "echoValue": 1,
        "manualDns": 1,
        "primaryDns": 1,
        "secondaryDns": 1,
        "customPrimaryDns": 1,
        "customSecondaryDns": 1,
        "wanOverviewAddBtn": 1,
        "bridgeLanEnable": 1,
        "bridgeSsidEnable": 1,
        "wanDhcp": {
          "visibility": 1,
          "dhcp51": 1,
          "dhcp61": 1,
          "dhcp61": 1,
          "dhcp77": 1,
          "dhcp91": 1,
          "vendorClassIdentifer61": 1,
          "clientIdentifier61": 1,
          "userClassInformation": 1,
          "authenticationInformation": 1
        },
        "wanAutoPortBinding": 1,
        "saveButton": 1,
        "deleteButton": 1
      },
      "wanStatistics": {
        "overview": 1,
        "visibility": 1,
        "wanPortStatus": {
          "ethernetLinkStatus": 1,
          "syncSpeed": 1,
          "duplex": 1
        },
        "service": {
          "refreshButton": 1,
          "wanConnectionList": 1,
          "enabled": 1
        },
        "serviceDetails": {
          "accessType": 1,
          "connectionMode": 1,
          "vlan": 1,
          "wanLinkStatus": 1,
          "DHCPKeepAlive": 1,
          "ipv4Address": 1,
          "ppoeConcentrator": 1,
          "macAddress": 1,
          "netMask": 1,
          "gateway": 1,
          "primaryDns": 1,
          "secondaryDns": 1,
          "ponLinkStatus": 1,
          "txPackets": 1,
          "rxPackets": 1,
          "txDropped": 1,
          "rxDropped": 1,
          "errorPackets": 1
        },
        "portStatistics": {
          "visibility": 1
        }
      },
      "tr169": {
        "visibility": 1,
        "refreshButton": 1,
        "enable": 1,
        "periodicInformEnabled": 1,
        "periodicInformInterval": 1,
        "url": 1,
        "username": 1,
        "password": 1,
        "connectRequestUsername": 1,
        "connectRequestPassword": 1,
        "saveButton": 1
      },
      "tr369": {
        "visibility": 1,
        "refreshButton": 1,
        "enabletr369": 1,
        "controllerEndpointId": 1,
        "mtpProtocol": 1,
        "transport": 1,
        "brokerAddress": 1,
        "brokerPort": 1,
        "username": 1,
        "password": 1,
        "saveButton": 1
      },
      "staticRouting": {
        "visibility": 1,
        "refreshButton": 1,
        "ipRouting": {
          "visibility": 1,
          "routingEnabled": 1,
          "destinationIpAddress": 1,
          "destinationNetmask": 1,
          "gateway": 1,
          "ipv4Interface": 1,
          "forwardingPolicy": 1,
          "helpButton": 1
        },
        "ipRoutingTable": {
          "visibility": 1,
          "destinationIpAddress": 1,
          "destinationNetMask": 1,
          "gateway": 1,
          "interface": 1,
          "forwardingPolicy": 1,
          "enable": 1,
          "delete": 1
        },
        "domainRouting": {
          "visibility": 1,
          "enable": 1,
          "saveButton": 1,
          "domainName": 1,
          "mode": 1,
          "service": 1,
          "addButton": 1
        },
        "domainRoutingTable": {
          "visibility": 1,
          "domainName": 1,
          "mode": 1,
          "service": 1,
          "deleteButton": 1
        }
      },
      "opticsModuleStatus": {
        "visibility": 1,
        "refreshButton": 1,
        "serialNumber": 1,
        "laserBiasCurrent": 1,
        "opticsModuleVoltage": 1,
        "opticsModuleTemperature": 1,
        "rxOpticsSignalLevel": 1,
        "txOpticsSignalLevel": 1,
        "lower": 1,
        "upper": 1
      },
      "qoSSetting": {
        "visibility": 1,
        "refreshButton": 1,
        "qoSSettingTable": {
          "visibility": 1,
          "id": 1,
          "sourceMac": 1,
          "souceMacMaskData": 1,
          "sourceMacExclude": 1,
          "protocol": 1,
          "protocolExclude": 1,
          "sourcePort": 1,
          "sourceMax": 1,
          "sExclude": 1,
          "destinationPort": 1,
          "destinationMax": 1,
          "dExclude": 1,
          "sourceIpList": {
            "visibility": 1,
            "sourceIp": 1,
            "sourceIpMask": 1,
            "sExclude": 1
          },
          "destinationIpList": {
            "visibility": 1,
            "destinationIp": 1,
            "destinationIpMask": 1,
            "dExclude": 1
          },
          "dscp": 1,
          "dscpRemark": 1,
          "interface": 1,
          "forwardingPolicy": 1,
          "status": 1,
          "enable": 1,
          "remark812Ip": 1,
          "deleteButton": 1
        },
        "type": 1,
        "classificationCriteria": {
          "visibility": 1,
          "sourceMac": 1,
          "enableSourceMacMaskData": 1,
          "souceMacMaskData": 1,
          "exclude": 1,
          "interface": 1,
          "protocol": 1,
          "application": 1,
          "protocolExclude": 1,
          "sourceIpList": {
            "visibility": 1,
            "sourceIp": 1,
            "sourceIpMask": 1,
            "sExclude": 1
          },
          "destinationIpList": {
            "visibility": 1,
            "destinationIp": 1,
            "destinationIpMask": 1,
            "dExclude": 1
          },
          "sourcePortList": {
            "visibility": 1,
            "sourcePort": 1,
            "sourceExclude": 1,
            "sourcePortMax": 1
          },
          "destinationPortList": {
            "visibility": 1,
            "destinationPort": 1,
            "destinationExclude": 1,
            "destinationPortMax": 1
          },
          "remark812Ip": 1
        },
        "classificationResults": {
          "visibility": 1,
          "dscpRemark": 1,
          "remark812Ip": 1,
          "forwardingPolicy": 1
        },
        "addButton": 1
      },
      "greTunnel": {
        "visibility": 1,
        "refreshButton": 1,
        "ipMode": 1,
        "tunnelName": 1,
        "wanInterface": 1,
        "primaryRemoteEnd": 1,
        "secondaryRemoteEnd": 1,
        "connectedRemoteEnd": 1,
        "connectivityCheck": 1,
        "trafficTimeout": 1,
        "noOfRetries": 1,
        "saveButton": 1,
        "deleteButton": 1
      },
      "ipSecTunnel": {
        "visibility": 1,
        "refreshButton": 1,
        "ipSecEnabled": 1,
        "ipMode": 1,
        "tunnelName": 1,
        "wanInterface": 1,
        "remoteEndpoint": 1,
        "preSharedKey": 1,
        "peerSubnet": 1,
        "peerSubnetMask": 1,
        "localSubnet": 1,
        "localSubnetMask": 1,
        "lanInterface": 1,
        "ssid": 1,
        "allowedMacAddress": 1,
        "connectionStatus": 1,
        "saveButton": 1,
        "deleteButton": 1
      },
      "usClassifier": {
        "visibility": 1,
        "refreshButton": 1,
        "policy": {
          "visibility": 1,
          "tunnelType": 1,
          "tunnelInterface": 1,
          "vlanId": 1,
          "vlanTag": 1,
          "vlanPriority": 1,
          "ipTosDscp": 1,
          "drop": 1,
          "saveButton": 1,
          "resetButton": 1,
          "policyTable": {
            "visibility": 1,
            "name": 1,
            "tunnelType": 1,
            "tunnelInterface": 1,
            "vlanId": 1,
            "vlanTag": 1,
            "vlanPriority": 1,
            "ipTosDscp": 1,
            "drop": 1,
            "noOfRules": 1,
            "deleteButton": 1
          }
        },
        "classifier": {
          "visibility": 1,
          "interface": 1,
          "sourceMac": 1,
          "sourceIp": 1,
          "sourcePort": 1,
          "protocol": 1,
          "destinationMac": 1,
          "destinationIp": 1,
          "destinationPort": 1,
          "priority": 1,
          "saveButton": 1,
          "resetButton": 1,
          "classifierTable": {
            "visibility": 1,
            "name": 1,
            "interface": 1,
            "sourceMac": 1,
            "sourceIp": 1,
            "sourcePort": 1,
            "protocol": 1,
            "destinationMac": 1,
            "destinationIp": 1,
            "destinationPort": 1,
            "priority": 1,
            "noOfRules": 1,
            "deleteButton": 1
          }
        },
        "classifierRules": {
          "visibility": 1,
          "policy": 1,
          "classifier": 1,
          "interface": 1,
          "sourceMac": 1,
          "sourceIp": 1,
          "sourcePort": 1,
          "destinationMac": 1,
          "destinationIp": 1,
          "destinationPort": 1,
          "ipPortocolType": 1,
          "saveButton": 1,
          "resetButton": 1,
          "classifierRulesTable": {
            "visibility": 1,
            "name": 1,
            "policy": 1,
            "classifier": 1,
            "interface": 1,
            "sourceMac": 1,
            "sourceIp": 1,
            "sourcePort": 1,
            "destinationMac": 1,
            "destinationIp": 1,
            "destinationPort": 1,
            "ipPortocolType": 1,
            "deleteButton": 1
          }
        }
      }
    },
    "lan": {
      "visibility": 1,
      "dhcpIpv4": {
        "visibility": 1,
        "refreshButton": 1,
        "defaultServicePvid": {
          "visibility": 1
        },
        "portMode": {
          "visibility": 1
        },
        "dhcpIpv4Relay": {
          "visibility": 1,
          "dhcpRelayEnable": 1,
          "dhcpServerIpAddress": 1,
          "relayAgentIpAddress": 1,
          "saveButton": 1
        },
        "dhcp": {
          "visibility": 1,
          "iPv4Address": 1,
          "subnetMask": 1,
          "dhcpEnable": 1,
          "dhcpStartIpAddress": 1,
          "dhcpEndIpAddress": 1,
          "dhcpLeaseTime": 1,
          "primaryDns": 1,
          "secondaryDns": 1,
          "saveButton": 1
        },
        "staticDhcpEntry": {
          "visibility": 1,
          "macAddress": 1,
          "iPv4Address": 1,
          "addButton": 1
        },
        "lanTable": {
          "visibility": 1,
          "macAddress": 1,
          "iPv4Address": 1,
          "deleteButton": 1
        }
      },
      "dhcpIpv6": {
        "visibility": 1,
        "refreshButton": 1,
        "iPv6LanHostConfiguration": {
          "visibility": 1,
          "dnsServer": 1,
          "dnsInterface": 1,
          "prefixConfig": 1,
          "prefix": 1,
          "prefixInterface": 1,
          "preferredDns": 1,
          "alternateDns": 1
        },
        "dhcPv6ServerPool": {
          "visibility": 1,
          "dhcpStartIpAddress": 1,
          "dhcpEndIpAddress": 1,
          "checkAddressInfo": 1,
          "checkOtherInfo": 1,
          "maximumInterval": 1,
          "minimumInterval": 1,
          "saveButton": 1
        },
        "routerAdvertisement": {
          "visibility": 1,
          "maximumInterval": 1,
          "minimumInterval": 1
        },
        "lanPrefixConfigGateways": {
          "visibility": 1,
          "enablePrefixDelegation": 1,
          "prefixConfig": 1,
          "childPrefix": 1,
          "interface": 1,
          "childPrefixLength": 1
        }
      },
      "dns": {
        "visibility": 1,
        "refreshButton": 1,
        "dnsProxy": 1,
        "dnsProxySaveButton": 1,
        "domainName": 1,
        "ipv4Address": 1,
        "domainAddButton": 1,
        "originDomain": 1,
        "newDomain": 1,
        "originDomainAddButton": 1,
        "dnsTable": {
          "visibility": 1,
          "domainName": 1,
          "ipv4Address": 1,
          "deleteButton": 1
        },
        "dnsOriginTable": {
          "visibility": 1,
          "originDomain": 1,
          "newDomain": 1,
          "deleteButton": 1
        }
      },
      "lanStatistics": {
        "visibility": 1,
        "refreshButton": 1,
        "ssidName": 1,
        "lanWirelessInfo": {
          "visibility": 1,
          "wirelessStatus": 1,
          "wirelessChannel": 1,
          "wirelessEncryptionStatus": 1,
          "wirelessRxPackets": 1,
          "wirelessTxPackets": 1,
          "wirelessRxBytes": 1,
          "wirelessTxBytes": 1,
          "powerTransmission": 1
        },
        "lanEthernetInfo": {
          "visibility": 1,
          "ethernetStatus": 1,
          "ethernetIpAddress": 1,
          "ethernetSubnetMask": 1,
          "ethernetMacAddress": 1,
          "ethernetRxPackets": 1,
          "ethernetTxPackets": 1,
          "ethernetRxBytes": 1,
          "ethernetTxBytes": 1
        },
        "lanTable": {
          "visibility": 1
        }
      }
    },
    "wifi": {
      "visibility": 1,
      "wifiNetworks": {
        "visibility": 1,
        "refreshButton": 1,
        "password": 1,
        "enabled": 1,
        "ssidIndex": 1,
        "webManualChannelHideIndex": 1,
        "bandSteering": 1,
        "editBtn": 1,
        "addWifiNtwBtn": 1,
        "wifiDetails": {
          "visibility": 1,
          "ssidConfiguration": {
            "visibility": 1,
            "ssidSelect": 1,
            "ssidName": 1,
            "ssidEnabled": 1,
            "mloEnabled": 1,
            "ssidBroadcast": 1,
            "portMode": 1,
            "guestMode": 1,
            "isolation": 1,
            "maxUsers": 1,
            "encryptionMode": {
              "visibility": 1,
              "none": 1,
              "wpa2_personal": 1,
              "wpa3_personal": 1,
              "wpa_wpa2_personal": 1,
              "wpa3_personal_transition": 1,
              "wpa2_enterprise": 1,
              "wpa3_Enterprise": 1,
              "wpa_wpa2_enterprise": 1
            },
            "wpaVersion": 1,
            "wpaEncryptionMode": 1,
            "primaryRadiusServer": 1,
            "primaryRadiusPort": 1,
            "primaryRadiusPassword": 1,
            "radiusAccountingServerPort": 1,
            "radiusAccountingServerKey": 1,
            "radiusAccountingServerTimeInterval": 1,
            "wifiKey": 1,
            "wpaKey": 1,
            "showPassword": 1
          },
          "wps": {
            "visibility": 1,
            "wpsEnabled": 1,
            "wpsMode": 1,
            "wpsConnectButton": 1,
            "pinCodeNumber": 1,
            "getPinNumber": 1
          },
          "domainGrouping": 1,
          "saveButton": 1
        }
      },
      "guestNetwork": {
        "networkDetails": 1,
        "name": 1,
        "password": 1,
        "saveButton": 1,
        "enableGuestButton": 1
      },
      "networkMap": {
        "visibility": 1,
        "addWifiButton": 1,
        "mapTab": 1,
        "wifiPointsTab": {
          "visibility": 1,
          "connected": 1,
          "notConnected": 1
        },
        "deviceInfoDetails": {
          "visibility": 1,
          "refreshButton": 1,
          "connectionSignal": 1,
          "extenderConnection": 1,
          "ledStatus": 1,
          "deviceName": 1,
          "serialNumber": 1,
          "macAddress": 1,
          "ipAddress": 1,
          "softwareVersion": 1,
          "hardwareVersion": 1,
          "bootVersion": 1,
          "runningTime": 1,
          "chipset": 1,
          "vendor": 1,
          "onboardingStatus": 1,
          "backhaulStatus": 1,
          "locationNickname": 1,
          "rebootButton": 1,
          "factoryDefaultButton": 1,
          "deepFactoryReset": 1,
          "removeAPButton": 1
        }
      },
      "advancedSettings": {
        "visibility": 1,
        "refreshButton": 1,
        "optimizeNetwork": {
          "visibility": 1,
          "optimizeButton": 1
        },
        "wifi24": {
          "visibility": 1,
          "saveButton": 1,
          "wirelessEnabled": 1,
          "mode": 1,
          "bandwidth": 1,
          "channel": 1,
          "transmittingPower": 1,
          "channelSelection": 1,
          "ofdma24": 1,
          "wmm": 1,
          "enableMuMimo": 1,
          "totalMaxUsers": 1
        },
        "wifi5": {
          "visibility": 1,
          "saveButton": 1,
          "wirelessEnabled": 1,
          "bandwidth": 1,
          "channel": 1,
          "transmittingPower": 1,
          "channelSelection": 1,
          "ofdma5": 1,
          "wmm": 1,
          "enableDfs": 1,
          "enableMuMimo": 1,
          "totalMaxUsers": 1
        },
        "wifi5High": {
          "visibility": 1,
          "refreshButton": 1,
          "wirelessEnabled": 1,
          "bandwidth": 1,
          "channel": 1,
          "transmittingPower": 1,
          "channelSelection": 1,
          "ofdma5h": 1,
          "wmm": 1,
          "enableDfs": 1,
          "enableMuMimo": 1,
          "totalMaxUsers": 1
        }
      },
      "wirelessSchedule": {
        "visibility": 1,
        "refreshButton": 1,
        "scheduleEnabled": 1,
        "currentTime": 1,
        "startTime": 1,
        "endTime": 1,
        "recurrencePattern": 1,
        "deleteButton": 1,
        "addButton": 1
      },
      "wifiStatistics": {
        "visibility": 1,
        "refreshButton": 1,
        "staInformation": {
          "visibility": 1,
          "refreshButton": 1,
          "staTable": {
            "visibility": 1,
            "macAddress": 1,
            "ssidName": 1,
            "channel": 1,
            "connectionDuration": 1,
            "wifiMode": 1,
            "rssi": 1
          }
        },
        "neighboringAp": {
          "visibility": 1,
          "refreshButton": 1,
          "neighboringApTable": {
            "visibility": 1,
            "index": 1,
            "ssidName": 1,
            "macAddress": 1,
            "channel": 1,
            "rssi": 1,
            "authenticationMode": 1,
            "wifiMode": 1,
            "networkType": 1,
            "scanButton": 1
          }
        },
        "wlanStatistics": {
          "visibility": 1
        }
      }
    },
    "devices": {
      "visibility": 1,
      "refreshButton": 1,
      "connected": {
        "visibility": 1,
        "refreshButton": 1,
        "deviceName": 1,
        "signalStrength": 1,
        "connectedToWifiPoint": 1,
        "connectedToNetwork": 1,
        "ipv4": 1,
        "ipv6": 1,
        "deviceInformation": {
          "macAddress": 1,
          "ipAddress": 1,
          "assignedTo": 1,
          "connectedToWifiPoint": 1,
          "assignedPrefix": 1,
          "connectionTime": 1,
          "txRate": 1,
          "rxRate": 1,
          "wanService": 1,
          "connection": 1
        }
      },
      "notConnected": {
        "visibility": 1,
        "refreshButton": 1,
        "deviceName": 1,
        "signalStrength": 1,
        "deviceInformation": {
          "macAddress": 1,
          "ipAddress": 1,
          "assignedTo": 1,
          "wanService": 1,
          "connection": 1,
          "wifiStandard": 1,
          "lastSeen": 1,
          "deleteDevice": 1
        }
      }
    },
    "voice": {
      "visibility": 1,
      "refreshButton": 1,
      "voiceSetting": {
        "visibility": 1,
        "refreshButton": 1,
        "voiceSetting": {
          "visibility": 1,
          "outboundProxy": 1,
          "outboundProxyPort": 1,
          "proxyServer": 1,
          "proxyServerPort": 1,
          "registerServer": 1,
          "registerServerPort": 1,
          "userAgentDomain": 1,
          "userAgentPort": 1,
          "digitMap": 1,
          "dtmfMode": 1,
          "faxT38": 1
        },
        "lineSetting": {
          "visibility": 1,
          "potsLine": 1,
          "enable": 1,
          "directoryNumber": 1,
          "authUsername": 1,
          "authPassword": 1,
          "uri": 1
        },
        "saveButton": 1
      },
      "voicestatus": 1
    },
    "maintenance": {
      "visibility": 1,
      "password": {
        "visibility": 1,
        "refreshButton": 1,
        "originalPassword": 1,
        "newPassword": 1,
        "reEnterPassword": 1,
        "promptMessage": 1,
        "saveButton": 1
      },
      "gameMode": {
        "visibility": 1,
        "enable": 1
      },
      "firmwareUpgrade": {
        "visibility": 1,
        "refreshButton": 1,
        "selectFile": 1,
        "chooseFileButton": 1,
        "upgradeButton": 1,
        "upgradeStatus": 1
      },
      "loidAuthentication": {
        "visibility": 1,
        "refreshButton": 1,
        "loid": 1,
        "password": 1,
        "saveButton": 1
      },
      "slidConfiguration": {
        "visibility": 1,
        "refreshButton": 1,
        "currentSlid": 1,
        "enterNewSlid": 1,
        "slidMode": 1,
        "note": 1,
        "saveButton": 1
      },
      "deviceManagement": {
        "visibility": 1,
        "refreshButton": 1,
        "hostName": 1,
        "macAddress": 1,
        "hostAlias": 1,
        "addButton": 1,
        "deviceTable": {
          "visibility": 1,
          "hostName": 1,
          "hostAlias": 1,
          "deleteButton": 1
        }
      },
      "backupAndRestore": {
        "visibility": 1,
        "refreshButton": 1,
        "selectFile": 1,
        "chooseFileButton": 1,
        "importConfigFile": 1,
        "importButton": 1,
        "exportConfigFile": 1,
        "exportButton": 1
      },
      "diagnostics": {
        "visibility": 1,
        "refreshButton": 1,
        "protocol": 1,
        "wanConnectionList": 1,
        "ipOrDomainName": 1,
        "test": 1,
        "ping": 1,
        "traceRoute": 1,
        "pingTryTimes": 1,
        "packetLength": 1,
        "maxNoOfTraceHops": 1,
        "startButton": 1,
        "cancelButton": 1
      },
      "log": {
        "visibility": 1,
        "refreshButton": 1,
        "writingLevel": 1,
        "readingLevel": 1,
        "logInfo": 1,
        "saveButton": 1,
        "exportLog": 1
      },
      "deltaCfgTool": {
        "visibility": 1,
        "refreshButton": 1,
        "mergeDeltaCfgFile": 1,
        "chooseFileButton": 1,
        "startRecordDeltaCfgButton": 1,
        "exportDeltaCfgButton": 1
      },
      "containerManagement": {
        "visibility": 1,
        "refreshButton": 1,
        "containerAppStatus": 1,
        "appName": 1,
        "version": 1,
        "status": 1
      },
      "syslog": {
        "visibility": 1,
        "syslogStatus": 1,
        "option": 1,
        "remoteLogLevel": 1,
        "serverIpAddress": 1,
        "serverPortNumber": 1,
        "syslogProtocol": 1
      }
    },
    "troubleshooting": {
      "visibility": 1,
      "refreshButton": 1,
      "troubleshootingCounters": {
        "visibility": 1,
        "wanConnectionList": 1,
        "wanStatus": 1,
        "usThroughput": 1,
        "dsThroughput": 1,
        "usPacketLoss": 1,
        "dsPacketLoss": 1,
        "latency": 1,
        "latencyTestButton": 1,
        "dnsResponseTime": 1,
        "dnsResponseTestButton": 1
      },
      "portMirror": {
        "visibility": 1,
        "sourcePort": 1,
        "destinationPort": 1,
        "direction": 1,
        "status": 1,
        "saveButton": 1
      },
      "portMirrorTable": {
        "visibility": 1,
        "sourcePort": 1,
        "destinationPort": 1,
        "direction": 1,
        "deleteButton": 1
      },
      "speedTest": {
        "visibility": 1,
        "refreshButton": 1,
        "saveButton": 1,
        "TR143serverSettings": {
          "visibility": 1,
          "uploadTestServerURL": 1,
          "uploadConnections": 1,
          "downloadTestServerURL": 1,
          "downloadConnections": 1,
          "testMode": 1,
          "host": 1,
          "duration": 1,
          "uploadFileSize": 1
        },
        "results": {
          "visibility": 1,
          "uploadSpeed": 1,
          "downloadSpeed": 1,
          "latency": 1,
          "startTestButton": 1
        }
      }
    },
    "application": {
      "visibility": 1,
      "ddns": {
        "visibility": 1,
        "refreshButton": 1,
        "wanConnectionList": 1,
        "ddnsEnabled": 1,
        "isp": 1,
        "domainName": 1,
        "username": 1,
        "password": 1,
        "saveButton": 1
      },
      "ntp": {
        "visibility": 1,
        "refreshButton": 1,
        "ntpServiceEnabled": 1,
        "currentDateTime": 1,
        "primaryTimeServer": 1,
        "secondaryTimeServer": 1,
        "tertiaryTimeServer": 1,
        "intervalTime": 1,
        "timeZone": 1,
        "saveButton": 1
      },
      "portForwarding": {
        "visibility": 1,
        "refreshButton": 1,
        "applicationName": 1,
        "wanPort": 1,
        "lanPort": 1,
        "internalClient": 1,
        "protocol": 1,
        "enableMapping": 1,
        "wanConnectionList": 1,
        "description": 1,
        "saveButton": 1,
        "portForwardingTable": {
          "visibility": 1,
          "applicationName": 1,
          "wanConnection": 1,
          "wanPort": 1,
          "lanPort": 1,
          "deviceName": 1,
          "internalClient": 1,
          "protocol": 1,
          "description": 1,
          "status": 1,
          "configurationSource": 1,
          "deleteButton": 1
        }
      },
      "portTriggering": {
        "visibility": 1,
        "refreshButton": 1,
        "applicationName": 1,
        "openPort": 1,
        "triggeringPort": 1,
        "expireTime": 1,
        "openProtocol": 1,
        "triggerProtocol": 1,
        "enableTriggering": 1,
        "wanConnectionList": 1,
        "saveButton": 1,
        "portTriggeringTable": {
          "visibility": 1,
          "applicationName": 1,
          "wanConnection": 1,
          "openPort": 1,
          "triggeringPort": 1,
          "expireTime": 1,
          "openProtocol": 1,
          "triggerProtocol": 1,
          "status": 1,
          "configurationSource": 1,
          "deleteButton": 1
        }
      },
      "usb": {
        "visibility": 1,
        "refreshButton": 1,
        "ftp": {
          "visibility": 1,
          "enableFtpserver": 1,
          "username": 1,
          "password": 1,
          "reEnterPassword": 1
        },
        "sftp": {
          "visibility": 1,
          "enableSftpServer": 1,
          "enableSftpForRemote": 1,
          "username": 1,
          "password": 1,
          "reEnterPassword": 1
        },
        "printerSharing": {
          "visibility": 1,
          "enablePrinterSharing": 1,
          "username": 1,
          "password": 1,
          "reEnterPassword": 1
        },
        "connectedUsbDevicesTable": {
          "visibility": 1,
          "hostNumber": 1,
          "deviceName": 1,
          "format": 1,
          "totalSpace": 1,
          "freeSpace": 1
        },
        "saveButton": 1
      },
      "upnpAndDlna": {
        "visibility": 1,
        "refreshButton": 1,
        "enableUpnpAndDlna": 1,
        "saveButton": 1
      },
      "upnp": {
        "visibility": 1,
        "refreshButton": 1,
        "enableUpnp": 1,
        "saveButton": 1
      }
    },
    "security": {
      "visibility": 1,
      "firewall": {
        "visibility": 1,
        "refreshButton": 1,
        "securityLevel": 1,
        "attackProtection": 1,
        "saveButton": 1,
        "securityLevelList": {
          "off": 1
        }
      },
      "macFilter": {
        "visibility": 1,
        "refreshButton": 1,
        "ethernetInterface": {
          "visibility": 1,
          "macFilterMode": 1,
          "lanPort": 1,
          "macAddress": 1,
          "saveButton": 1
        },
        "macAddressTable": {
          "visibility": 1,
          "macAddress": 1,
          "deleteButton": 1
        },
        "wifiSsid": {
          "visibility": 1,
          "macFilterMode": 1,
          "ssidSelect": 1,
          "enable": 1,
          "macAddress": 1,
          "macAddressDescription": 1,
          "saveButton": 1
        },
        "wifiSsidTable": {
          "visibility": 1,
          "status": 1,
          "index": 1,
          "description": 1,
          "macAddress": 1,
          "edit": 1,
          "delete": 1,
          "selectedAll": 1,
          "deleteButton": 1
        }
      },
      "ipFilter": {
        "visibility": 1,
        "refreshButton": 1,
        "enableIpFilter": 1,
        "mode": 1,
        "internalClient": 1,
        "localIpAddress": 1,
        "localSubnetMask": 1,
        "remoteIpAddress": 1,
        "remoteSubnetMask": 1,
        "protocol": 1,
        "sourceStartPort": 1,
        "sourceEndPort": 1,
        "destinationStartPort": 1,
        "destinationEndPort": 1,
        "saveButton": 1,
        "ipFilterTable": {
          "visibility": 1,
          "mode": 1,
          "internalClient": 1,
          "protocol": 1,
          "localIpAddress": 1,
          "localSubnetMask": 1,
          "remoteIpAddress": 1,
          "remoteSubnetMask": 1,
          "wanPortRange": 1,
          "lanPortRange": 1,
          "deleteButton": 1
        }
      },
      "urlFilter": {
        "visibility": 1,
        "refreshButton": 1,
        "enableUrlFilter": 1,
        "urlFilterType": 1,
        "urlAddress": 1,
        "portNumber": 1,
        "urlTable": {
          "visibility": 1,
          "urlAddress": 1,
          "portNumber": 1,
          "deleteButton": 1
        },
        "addFilterButton": 1
      },
      "dmzAndAlg": {
        "visibility": 1,
        "refreshButton": 1,
        "algConfig": {
          "visibility": 1,
          "ftp": 1,
          "tftp": 1,
          "sip": 1,
          "h323": 1,
          "rtsp": 1,
          "l2tp": 1,
          "ipsec": 1,
          "pptp": 1,
          "saveButton": 1
        },
        "dmzConfig": {
          "visibility": 1,
          "wanConnectionList": 1,
          "enableDmz": 1,
          "dmzIpAddress": 1,
          "saveButton": 1
        }
      },
      "parentalControl": {
        "visibility": 1,
        "refreshButton": 1,
        "groupList": 1,
        "groupName": 1,
        "device": 1,
        "accessInternet": 1,
        "url": 1,
        "schedule": 1,
        "bedtime": 1,
        "deleteButton": 1,
        "addButton": 1
      },
      "accessControl": {
        "visibility": 1,
        "refreshButton": 1,
        "wanConnectionList": 1,
        "enableTrustedNetwork": 1,
        "wanLanTable": {
          "wan": {
            "visibility": 1,
            "icmp": 1,
            "telnet": 1,
            "ssh": 1,
            "http": 1,
            "tr169": 1,
            "https": 1,
            "sftp": 1
          },
          "lan": {
            "visibility": 1,
            "icmp": 1,
            "telnet": 1,
            "ssh": 1,
            "http": 1,
            "tr169": 1,
            "https": 1,
            "sftp": 1
          },
          "saveButton": 1
        },
        "trustedNetwork": {
          "visibility": 1,
          "sourceIpStart": 1,
          "sourceIpEnd": 1,
          "addButton": 1
        },
        "sourceIpTable": {
          "visibility": 1,
          "sourceIpStart": 1,
          "sourceIpEnd": 1,
          "deleteButton": 1
        }
      }
    }
  },
  "ProdCfgData": {
    "Version": "1.1",
    "ProductParameters": {
      "Manufacturer": "Nokia",
      "ModelName": "Beacon G6",
      "ModelNumber": "3FE49741AAAA",
      "ProductClass": "Beacon G6",
      "1915EnabledInterfaceNames": "ecd1, ssid1, ssid11, ssid12, ssid13, ssid14, ssid15, ssid1, ssid11, ssid12, ssid13, eth1.1, eth2.1, eth3.1",
      "MAPProfile": 1,
      "NumberOfWifiRadios": 2,
      "NumberOfEthernetPorts": 4,
      "TR143UploadConnections": 8,
      "TR143DownloadConnections": 8,
      "ConfigPath": "\/configs",
      "LogPath": "\/logs",
      "Ethernet": [
        {
          "PhysicalPortNumber": 1,
          "InterfaceName": "eth1",
          "MaxBitRate": 1111
        },
        {
          "PhysicalPortNumber": 2,
          "InterfaceName": "eth2",
          "MaxBitRate": 1111
        },
        {
          "PhysicalPortNumber": 3,
          "InterfaceName": "eth3",
          "MaxBitRate": 2511
        },
        {
          "PhysicalPortNumber": 4,
          "InterfaceName": "wan1_eth",
          "MaxBitRate": 2511
        }
      ],
      "Wifi": [
        {
          "OperatingFrequencyBand": "2.4GHZ",
          "ChipsetVendor": "Qualcomm",
          "MaxSupportedSSIDs": 4,
          "InterfaceName": "ssid1",
          "DeviceName": "wifi1",
          "SupportedOperatingChannelBandwidths": "21MHz,41MHz",
          "SupportedStandards": "b,g,bg,ng,axg",
          "SupportedAuthenticationMode": "WPA,WPA2,WPA3",
          "HTShortGI21MHz": "Supported",
          "HTShortGI41MHz": "Supported",
          "HT41MHz": "Supported",
          "HTNumberOfTxStreams": 4,
          "HTNumberOfRxStreams": 4,
          "VHTShortGI81MHz": "Not Supported",
          "VHTShortGI161And81+81MHz": "Not Supported",
          "VHTNumberOfTxStreams": 4,
          "VHTNumberOfRxStreams": 4,
          "VHT81+81MHz": "Not Supported",
          "VHT161MHz": "Not Supported",
          "VHTSUBeamFormer": "Supported",
          "VHTMUBeamFormer": "Supported",
          "VHTTxMCS": 9,
          "VHTRxMCS": 9,
          "HEULMUMIMO": "Supported",
          "HEULMUMIMOOFDMA": "Supported",
          "HEDLMUMIMOOFDMA": "Supported",
          "HEULOFDMA": "Supported",
          "HEDLOFDMA": "Supported",
          "HENumberOfTxStreams": 4,
          "HENumberOfRxStreams": 4,
          "HE81+81MHz": "Not Supported",
          "HE161MHz": "Not Supported",
          "HESUBeamFormer": "Supported",
          "HEMUBeamFormer": "Supported",
          "HEMCSNSS": "\/6r\/qg==",
          "HESUBeamFormee": "Supported",
          "HEBeamFormeeSTSLess81": "Supported",
          "HEBeamFormeeSTSGreater81": "Not Supported",
          "HEMAXDLMUMIMOTX": 4,
          "HEMAXULMUMIMORX": 4,
          "HEMAXDLOFDMATX": 8,
          "HEMAXULOFDMARX": 8,
          "HERTS": "Supported",
          "HEMURTS": "Not Supported",
          "HEMultiBSSID": "Not Supported",
          "HEMUEDCA": "Supported",
          "HETWTRequester": "Not Supported",
          "HETWTResponder": "Supported",
          "STAMODE": {
            "HEULMUMIMO": "Not Supported",
            "HEULOFDMA": "Not Supported",
            "HEDLOFDMA": "Not Supported",
            "HE81+81MHz": "Not Supported",
            "HE161MHz": "Not Supported",
            "HESUBeamFormer": "Not Supported",
            "HEMUBeamFormer": "Not Supported",
            "HEMCSNSS": "\/6r\/qg==",
            "HESUBeamFormee": "Supported",
            "HEBeamFormeeSTSLess81": "Supported",
            "HEBeamFormeeSTSGreater81": "Not Supported",
            "HEMAXDLMUMIMOTX": 1,
            "HEMAXULMUMIMORX": 1,
            "HEMAXDLOFDMATX": 1,
            "HEMAXULOFDMARX": 1,
            "HERTS": "Supported",
            "HEMURTS": "Not Supported",
            "HEMultiBSSID": "Not Supported",
            "HEMUEDCA": "Not Supported",
            "HETWTRequester": "Not Supported",
            "HETWTResponder": "Supported"
          },
          "HEMCS": {
            "RxMapLE81MHz": 1,
            "TxMapLE81MHz": 1,
            "RxMap161MHz": 1,
            "TxMap161MHz": 1,
            "RxMap81+81MHz": 1,
            "TxMap81+81MHz": 1
          },
          "Vap": [
            {
              "InterfaceName": "ssid1",
              "Mode": "ap",
              "DataModelIndex": 1
            },
            {
              "InterfaceName": "ssid11",
              "Mode": "ap",
              "DataModelIndex": 2
            },
            {
              "InterfaceName": "ssid12",
              "Mode": "ap",
              "DataModelIndex": 3
            },
            {
              "InterfaceName": "ssid13",
              "Mode": "ap",
              "DataModelIndex": 4
            },
            {
              "InterfaceName": "ssid14",
              "Mode": "ap",
              "DataModelIndex": 1
            }
          ],
          "NoiseBias": [
            {
              "ChannelBandwidth": "21MHz",
              "NoiseBiasIndBm": 6
            },
            {
              "ChannelBandwidth": "41MHz",
              "NoiseBiasIndBm": 6
            }
          ],
          "RssiBias": [
            {
              "ChannelBandwidth": "21MHz",
              "RssiBiasIndBm": 1
            },
            {
              "ChannelBandwidth": "41MHz",
              "RssiBiasIndBm": 1
            }
          ],
          "NoCATBias": 1,
          "AntennaGain": 3
        },
        {
          "OperatingFrequencyBand": "5GHZ",
          "ChipsetVendor": "Qualcomm",
          "MaxSupportedSSIDs": 4,
          "InterfaceName": "ssid1",
          "DeviceName": "wifi1",
          "SupportedOperatingChannelBandwidths": "21MHz,41MHz,81MHz,161MHz",
          "SupportedStandards": "a,na,ac,axa",
          "SupportedAuthenticationMode": "WPA,WPA2,WPA3",
          "HTShortGI21MHz": "Supported",
          "HTShortGI41MHz": "Supported",
          "HT41MHz": "Supported",
          "HTNumberOfTxStreams": 4,
          "HTNumberOfRxStreams": 4,
          "VHTShortGI81MHz": "Supported",
          "VHTShortGI161And81+81MHz": "Supported",
          "VHTNumberOfTxStreams": 4,
          "VHTNumberOfRxStreams": 4,
          "VHT81+81MHz": "Supported",
          "VHT161MHz": "Supported",
          "VHTSUBeamFormer": "Supported",
          "VHTMUBeamFormer": "Supported",
          "VHTTxMCS": 9,
          "VHTRxMCS": 9,
          "HEULMUMIMO": "Supported",
          "HEULMUMIMOOFDMA": "Supported",
          "HEDLMUMIMOOFDMA": "Supported",
          "HEULOFDMA": "Supported",
          "HEDLOFDMA": "Supported",
          "HENumberOfTxStreams": 4,
          "HENumberOfRxStreams": 4,
          "HE81+81MHz": "Supported",
          "HE161MHz": "Supported",
          "HESUBeamFormer": "Supported",
          "HEMUBeamFormer": "Supported",
          "HEMCSNSS": "\/6r\/qv+q\/6o=",
          "HESUBeamFormee": "Supported",
          "HEBeamFormeeSTSLess81": "Supported",
          "HEBeamFormeeSTSGreater81": "Supported",
          "HEMAXDLMUMIMOTX": 4,
          "HEMAXULMUMIMORX": 4,
          "HEMAXDLOFDMATX": 8,
          "HEMAXULOFDMARX": 8,
          "HERTS": "Supported",
          "HEMURTS": "Not Supported",
          "HEMultiBSSID": "Not Supported",
          "HEMUEDCA": "Supported",
          "HETWTRequester": "Not Supported",
          "HETWTResponder": "Supported",
          "STAMODE": {
            "HEULMUMIMO": "Not Supported",
            "HEULOFDMA": "Not Supported",
            "HEDLOFDMA": "Not Supported",
            "HE81+81MHz": "Supported",
            "HE161MHz": "Supported",
            "HESUBeamFormer": "Not Supported",
            "HEMUBeamFormer": "Not Supported",
            "HEMCSNSS": "\/6r\/qv+q\/6o=",
            "HESUBeamFormee": "Supported",
            "HEBeamFormeeSTSLess81": "Supported",
            "HEBeamFormeeSTSGreater81": "Supported",
            "HEMAXDLMUMIMOTX": 1,
            "HEMAXULMUMIMORX": 1,
            "HEMAXDLOFDMATX": 1,
            "HEMAXULOFDMARX": 1,
            "HERTS": "Supported",
            "HEMURTS": "Not Supported",
            "HEMultiBSSID": "Not Supported",
            "HEMUEDCA": "Not Supported",
            "HETWTRequester": "Not Supported",
            "HETWTResponder": "Supported"
          },
          "HEMCS": {
            "RxMapLE81MHz": 1,
            "TxMapLE81MHz": 1,
            "RxMap161MHz": 1,
            "TxMap161MHz": 1,
            "RxMap81+81MHz": 1,
            "TxMap81+81MHz": 1
          },
          "Vap": [
            {
              "InterfaceName": "ssid1",
              "Mode": "ap",
              "DataModelIndex": 5
            },
            {
              "InterfaceName": "ssid11",
              "Mode": "ap",
              "DataModelIndex": 6
            },
            {
              "InterfaceName": "ssid12",
              "Mode": "ap",
              "DataModelIndex": 7
            },
            {
              "InterfaceName": "ssid13",
              "Mode": "ap",
              "DataModelIndex": 8
            },
            {
              "InterfaceName": "ssid14",
              "Mode": "ap",
              "DataModelIndex": 1
            },
            {
              "InterfaceName": "ath15",
              "Mode": "ap",
              "DataModelIndex": 1
            }
          ],
          "NoiseBias": [
            {
              "ChannelBandwidth": "21MHz",
              "NoiseBiasIndBm": 6
            },
            {
              "ChannelBandwidth": "41MHz",
              "NoiseBiasIndBm": 6
            },
            {
              "ChannelBandwidth": "81MHz",
              "NoiseBiasIndBm": 6
            },
            {
              "ChannelBandwidth": "161MHz",
              "NoiseBiasIndBm": 6
            }
          ],
          "RssiBias": [
            {
              "ChannelBandwidth": "21MHz",
              "RssiBiasIndBm": 1
            },
            {
              "ChannelBandwidth": "41MHz",
              "RssiBiasIndBm": 1
            },
            {
              "ChannelBandwidth": "81MHz",
              "RssiBiasIndBm": 1
            },
            {
              "ChannelBandwidth": "161MHz",
              "RssiBiasIndBm": 1
            }
          ],
          "NoCATBias": 1,
          "AntennaGain": 3
        }
      ],
      "NWApplicationList": {
        "EasyMesh": "yes",
        "UserAgent": "yes",
        "HomeAgent": "yes",
        "OTA": "yes",
        "BoENG": "yes",
        "AIEngine": "yes",
        "LocalRRMEnabled": "no",
        "USPAgent": "yes"
      },
      "HomeAgentAppList": {
        "L1Agent": "yes",
        "L2Agent": "yes"
      },
      "ContainerResources": {
        "AllocatedDiskSpace": 131172,
        "AllocatedMemory": 131172
      },
      "webConfig": {
        "DeviceType": "ONT",
        "SupportUSB": 1,
        "SupportsPortMirror": 1,
        "SocVendor": "Cortina",
        "SupportContainerManagement": 1,
        "UplinkType": "Ethernet",
        "SupportUpnpDlna": 1,
        "SupportSignalLed": 1,
        "SupportBandSteering": 1,
        "SupportMimo": 1,
        "SupportRRM": 1,
        "SupportDFS": 1,
        "SupportWPS": 1,
        "SupportWifi": 1,
        "SupportPoE": 1,
        "WifiVersion": "wifi6",
        "SupportMaxUsers": "128",
        "Forwarding": {
          "SupportWanBridgeMode": {
            "Transparent": 1,
            "Tunnel": 1,
            "VlanBinding": 1
          },
          "SupportGRETunnel": 1,
          "SupportIsolation": 1,
          "SupportAllBridgeMode": 1,
          "SupportSpeedTest": 1,
          "SupportGameMode": 1,
          "SupportIPSec": 1,
          "SupportLanIpReservation": 1,
          "SupportPortMode": 1,
          "SupportSyslog": 1
        },
        "Cellular": {
          "SupportCellMeasurement": 1,
          "SupportCBRS": 1,
          "SupportPreLogin": 1,
          "SupportFWALanWan": 1
        }
      }
    }
  }
}





);
        
        // 2. Clear the original response body and insert the new JSON
        msg.setResponseBody(customJson);
        
        // 3. Overwrite or set HTTP response headers appropriately
        msg.getResponseHeader().setStatusCode(200);
        msg.getResponseHeader().setReasonPhrase("OK");
        msg.getResponseHeader().setHeader("Content-Type", "application/json; charset=utf-8");
        msg.getResponseHeader().setContentLength(msg.getResponseBody().length());
        
        // Print a confirmation message to the ZAP Output tab
        print("[*] Successfully mocked response for: " + uri);
    }
    
    return true; // Continue processing the response pipeline
}
