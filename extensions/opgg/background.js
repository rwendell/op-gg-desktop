let r = null;
let t = null;
let prevRoomName = "";

let riot_path = "C:/Riot Games/League of Legends";
let riot_url = "";

let multiSearchTabId = 0;
let championSearchTabId = 0;
let settingsTabId = 0;
let banpickTabId = 0;

let currentSummoner = {};
let currentChampionId = 0;

let currentGameQueueId = 0;

let directoryWrong = 0;
let minRuneLevel = 15;

let isSettingMessage = false;
let isSettingMessage2 = false;

let refresh_rate = 2000;

let region = "";
let regionMap = {
    "cs_CZ": "eune",
    "el_GR": "eune",
    "pl_PL": "eune",
    "ro_RO": "eune",
    "hu_HU": "eune",
    "en_GB": "euw",
    "de_DE": "euw",
    "es_ES": "euw",
    "it_IT": "euw",
    "fr_FR": "euw",
    "ja_JP": "jp",
    "ko_KR": "www",
    "es_MX": "lan",
    "es_AR": "las",
    "pt_BR": "br",
    "en_US": "na",
    "en_AU": "oce",
    "ru_RU": "ru",
    "tr_TR": "tr",
    "ms_MY": "sg",
    "en_PH": "ph",
    "en_SG": "sg",
    "th_TH": "th",
    "vn_VN": "vn",
    "id_ID": "id",
    "zh_MY": "",
    "zh_CN": "",
    "zh_TW": "tw"
};

let regionReal = "";
let regionMapReal = {
    "KR": "www",
    "JP": "jp",
    "NA": "na",
    "EUW": "euw",
    "EUNE": "eune",
    "OCE": "oce",
    "BR": "br",
    "LAS": "las",
    "LAN": "lan",
    "RU": "ru",
    "TR": "tr",
    "SG": "sg",
    "ID": "id",
    "PH": "ph",
    "TW": "tw",
    "VN": "vn",
    "TH": "th",
    "LA1": "lan",
    "LA2": "las",
    "OC1": "oce",
}

let builds = ['item_start', 'item_recommend', 'item_boots'];

let isMultisearchAllowed = true;
let isChampionAllowed = true;
let isAutoRuneAllowed = false;
let isItemRecommendAllowed = false;
let isBanAllowed = true;

let isFileUrlAllowed = true;
let isLocalhostAllowed = true;

let team1 = [0, 1, 2, 3, 4];
let team2 = [5, 6, 7, 8 ,9];
let prevActions = "";
let isFirstRun = true;

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37377845-16']);
_gaq.push(['_trackPageview']);

(function() {
    let ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    let s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function updatePick(tabid, team, pos, champ) {
    chrome.tabs.executeScript(tabid, {
        "code": "var myScript = document.createElement('script');"
            + "myScript.textContent = \"updateChampion('"+team+"', "+pos+", "+champ+");\";"
            + "document.head.appendChild(myScript);"
    });
}

function updateBan(tabid, team, pos, champ) {
    chrome.tabs.executeScript(tabid, {
        "code": "var myScript = document.createElement('script');"
            + "myScript.textContent = \"updateBan('"+team+"', "+pos+", "+champ+");\";"
            + "document.head.appendChild(myScript);"
    });
}

function openChampionTab(currentChampionId, lineType, gameType, isUrf=false) {
    let championName = "";

    $.ajax({
        type: 'GET',
        async: false,
        dataType: 'json',
        url: riot_url+'/lol-champions/v1/inventories/'+currentSummoner["summonerId"]+'/champions/'+currentChampionId,
        success: function(json) {
            if(isChampionAllowed) {
                _gaq.push(['_trackEvent', 'champions_'+gameType, 'opened']);
                chrome.windows.getAll(function(windows) {
                    if (windows.length === 0) {
                        chrome.windows.create({url: "chrome://newtab"});
                    }

                    let opggUrl = "https://"+region+".op.gg/champion/"+json['alias'];
                    if (isUrf) {
                        opggUrl = "https://"+region+".op.gg/urf/"+json['alias']+"/statistics";
                    }

                    if (championSearchTabId === 0) {
                        chrome.tabs.create({url: opggUrl}, function(newTab) {
                            championSearchTabId = newTab.id;
                        });
                    } else {
                        // chrome.tabs.update(championSearchTabId, {url: "http://"+region+".op.gg/champion/"+json['alias']+"/statistics/"+lineType, active:true, highlighted:true});
                        chrome.tabs.update(championSearchTabId, {url: opggUrl, active:true, highlighted:true});
                    }
                });
            }
           championName = json['alias'];
        }
    });

    return championName;
}

function parseChampion(championName, type, championId=0, isUrf=false) {
    let opggUrl = "https://"+region+".op.gg/champion/"+championName+"/statistics";
    if (isUrf) {
        // temporary unused
        opggUrl = "https://"+region+".op.gg/urf/"+championName+"/statistics";
        // opggUrl = "https://"+region+".op.gg/champion/"+championName+"/statistics";
    }

    $.ajax({
        type: 'GET',
        dataType: 'text',
        url: opggUrl,
        success: function(data) {
            if (type === "perk") {
                let page = {
                  "autoModifiedSelections": [
                    0
                  ],
                  "current": true,
                  "id": 0,
                  "isActive": true,
                  "isDeletable": true,
                  "isEditable": true,
                  "isValid": true,
                  "lastModified": 0,
                  "name": "OP.GG",
                  "order": 0,
                  "primaryStyleId": 0,
                  "selectedPerkIds": [
                  ],
                  "subStyleId": 0
                };

                let perk_page_wrap = data.split('perk-page-wrap')[1];
                let primary_perk = perk_page_wrap.split('perk-page__item--mark')[1].split('perkStyle/')[1].split('.png')[0];
                let sub_perk = perk_page_wrap.split('perk-page__item--mark')[2].split('perkStyle/')[1].split('.png')[0];
                page["primaryStyleId"] = primary_perk;
                page["subStyleId"] = sub_perk;
                let perkids2 = perk_page_wrap.split('perk-page__item--active');
                for (let i = 1; i < perkids2.length; i++) {
                    let perkid = perkids2[i].split('perk/')[1].split('.png')[0];
                    page["selectedPerkIds"].push(perkid);
                }

                let fragments = perk_page_wrap.split('fragment__row');
                for (let i = 1; i < fragments.length; i++) {
                    let tmp = fragments[i].split('active')[0].split('perkShard/');
                    let shardid = tmp[tmp.length-1].split('.png')[0];
                    page["selectedPerkIds"].push(shardid);
                }
                newPerkPage(JSON.stringify(page));
            } 

            if (type === "item") {
                let totalItems = {};

                let itemBuilds = data.split('champion-overview__sub-header');

                for (let l = 1; l < itemBuilds.length; l++) {
                    let buildName = builds[l-1];
                    if (buildName !== builds[0]) {
                        totalItems[buildName] = [];
                    }
                    let itemBuild = itemBuilds[l].split('champion-overview__data champion-overview__border champion-overview__border--first');

                    for (let i = 1; i < itemBuild.length; i++) {
                        if (buildName === builds[0]) {
                            totalItems[buildName+i] = [];
                        }

                        let items = "";
                        if (itemBuild[i].indexOf('/img/item') >= 0) {
                            items = itemBuild[i].split('/img/item/');
                        } else {
                            items = itemBuild[i].split('/lol/item/');
                        }

                        for (let k = 1; k < items.length; k++) {
                            let item = items[k].split('.png')[0];

                            if (buildName !== builds[0]) {
                                if (totalItems[buildName].indexOf(item) === -1) {
                                    totalItems[buildName].push(item)
                                }
                            } else {
                                totalItems[buildName+i].push(item);
                            }
                        }
                    }
                }

                updateItemBuild(championName, totalItems, championId, isUrf);
            }
        }
    });
}

function updateItemBuild(championName, totalItems, championId, isUrf=false) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: riot_url+'/lol-item-sets/v1/item-sets/'+currentSummoner["summonerId"]+'/sets',
        success: function(json) {
            let blocks = [];

            for (let buildName in totalItems) {
                let block = {};
                let itemType = buildName;
                if (buildName.indexOf(builds[0]) >= 0) {
                    itemType = builds[0];
                }
                block["items"] = [];

                for (let k = 0; k < totalItems[buildName].length; k++) {
                    let tmp = {};
                    tmp["count"] = 1;
                    tmp["id"] = totalItems[buildName][k];
                    block["items"].push(tmp);
                }

                block["hideIfSummonerSpell"] = "";
                block["showIfSummonerSpell"] = "";
                block["type"] = chrome.i18n.getMessage(itemType);

                blocks.push(block);
            }

            let title = 'OP.GG ' + championName;
            if (isUrf) {
                title = title + " URF";
            }
            let itemSet = {
                "associatedChampions": championId === 0 ? [] : [championId],
                "associatedMaps": [],
                "blocks": blocks,
                "map": "any",
                "mode": "any",
                "preferredItemSlots": [],
                "sortrank": 0,
                "startedFrom": "blank",
                "title": title,
                "type": "custom",
                "uid": guid()
            };

            let buildUpdated = false;

            if (Object.keys(json["itemSets"]).length === 0) {
                json["itemSets"].push(itemSet);
            } else {
                 for (let i = 0; i < Object.keys(json["itemSets"]).length; i++) {
                    if (json["itemSets"][i]["title"] === title) {
                        json["itemSets"][i]["blocks"] = blocks;
                        buildUpdated = true;
                        break;
                    }
                }

                if (!buildUpdated) {
                    json["itemSets"].push(itemSet);
                }
            }

            $.ajax({
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(json),
                contentType: 'application/json',
                processData: false,
                url: riot_url+'/lol-item-sets/v1/item-sets/'+currentSummoner["summonerId"]+'/sets',
                success: function(json) {

                }
            });
        }
    });
}

function newPerkPage(page) {
    $.ajax({
        type: 'POST',
        dataType: 'json',
        data: page,
        contentType: 'application/json',
        processData: false,
        url: riot_url+'/lol-perks/v1/pages',
        success: function(json) {
        },
        error: function(json) {

        }
    });
}

function updatePerkPage(championName, isUrf=false) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: riot_url+'/lol-perks/v1/currentpage',
        success: function(json) {
            if (json["isDeletable"] == true) {
                $.ajax({
                    type: 'DELETE',
                    url: riot_url+'/lol-perks/v1/pages/'+json["id"],
                    success: function() {
                        parseChampion(championName, "perk", 0, isUrf);
                    },
                    error: function() {

                    }
                });
            } else {
                parseChampion(championName, "perk", 0, isUrf);
            }
        }
    });
}

function updatePerkPages(championName, isUrf=false) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: riot_url+'/lol-perks/v1/pages',
        success: function(json) {
            var isOPGGPageAvailable = false;

            for (var i = 0; i < Object.keys(json).length; i++) {
                var pageName = json[i]["name"];

                if (pageName == 'OP.GG') {
                    isOPGGPageAvailable = true;
                    $.ajax({
                        type: 'DELETE',
                        async: false,
                        url: riot_url+'/lol-perks/v1/pages/'+json[i]["id"],
                        success: function() {
                            parseChampion(championName, "perk", 0, isUrf);
                        },
                        error: function() {

                        }
                    });

                    break;   
                }
            }

            if (!isOPGGPageAvailable) {
                updatePerkPage(championName, isUrf);
            }
        }
    });
}

let tftMode = 0;
function leagueClientRunning(riot_url) {
    $.ajax({
        type: "GET",
        url: riot_url+"/riotclient/auth-token",
        success: function(res) {
            if (Object.keys(currentSummoner).length === 0) {
                $.ajax({
                    type: 'GET',
                    url: riot_url+'/lol-summoner/v1/current-summoner',
                    dataType: 'json',
                    success: function(json) {
                        currentSummoner = json;
                        chrome.extension.sendMessage({cmd: "loggedIn", summoner: currentSummoner});
                    }
                });
            } else {
                chrome.extension.sendMessage({cmd: "loggedIn", summoner: currentSummoner});
            }

            $.ajax({
                type: 'GET',
                url: riot_url+'/riotclient/region-locale',
                dataType: 'json',
                success: function(json) {
                    regionReal = json["region"];
                    region = regionMapReal[json["region"]];

                    if (region == undefined) {
                        region = regionMap[json["locale"]];
                    }

                    chrome.storage.local.set({region: region});
                    if (region == "www") {
                        chrome.storage.local.get(['notice_kr_server_down'], function(data) {
                            if (data.notice_kr_server_down == 1 || data.notice_kr_server_down == undefined) {
                                chrome.storage.local.set({notice_kr_server_down: 0});
                            }
                        });

                        clearInterval(r);
                        r = null;
                        t = setInterval(isLeagueClientOpened, refresh_rate);
                        return;
                    }

                    var gameType = "";

                    $.ajax({
                        type: 'GET',
                        dataType: 'json',
                        url: riot_url+"/lol-champ-select/v1/session",
                        success: function(json) {
                            if (currentGameQueueId === 0) {
                                $.ajax({
                                    type: 'GET',
                                    dataType: 'json',
                                    url: riot_url+"/lol-gameflow/v1/gameflow-metadata/player-status",
                                    async: false,
                                    success: function(json) {
                                        currentGameQueueId = json["currentLobbyStatus"]["queueId"];
                                    }
                                });
                            } else {
                                // TFT Mode
                                if (currentGameQueueId === 1090 || currentGameQueueId === 1100) {
                                    if(tftMode === 0) {
                                        tftMode = 1;
                                        _gaq.push(['_trackEvent', 'tft', 'opened']);
                                    }
                                } else {
                                    let cellLoc = json["localPlayerCellId"];
                                    let lineType = "";
                                    let summonerLevel = currentSummoner["summonerLevel"];

                                    let myTeam = [];

                                    if (team1.includes(cellLoc)) {
                                        myTeam = team1;
                                    } else {
                                        myTeam = team2;
                                    }

                                    for (let i = 0; i < json["myTeam"].length; i++) {
                                        if (json["myTeam"][i]["cellId"] === cellLoc) {
                                            switch (json["myTeam"][i]["assignedPosition"]) {
                                                case "TOP":
                                                    lineType = "top";
                                                    break;
                                                case "JUNGLE":
                                                    lineType = "jungle";
                                                    break;
                                                case "MIDDLE":
                                                    lineType = "mid";
                                                    break;
                                                case "BOTTOM":
                                                    lineType = "bot";
                                                    break;
                                                case "UTILITY":
                                                    lineType = "support";
                                                    break;
                                                default:
                                                    lineType = "";
                                            }
                                        }
                                    }

                                    if (isBanAllowed) {
                                        if (json["actions"].length !== 0) {
                                            if (json["actions"][0][0]["type"] == "ban") {
                                                let actions = json["actions"]

                                                if (isFirstRun) {
                                                    _gaq.push(['_trackEvent', 'banpick_ranked', 'opened']);

                                                    if (banpickTabId === 0) {
                                                        chrome.tabs.create({url: "https://www.op.gg/banpick"}, function (newTab) {
                                                            isFirstRun = false;

                                                            banpickTabId = newTab.id;
                                                            chrome.windows.create({
                                                                tabId: banpickTabId,
                                                                type: 'popup',
                                                                focused: true,
                                                                width: 500,
                                                                height: 950,
                                                                top: 50,
                                                                left: 0,
                                                            }, function (newWindow) {

                                                            });

                                                            let summonerNames = [];
                                                            let summonerLines = [];
                                                            let recent20games = [];
                                                            let recent10games = [];
                                                            let allGames = [];
                                                            let puuids = [];
                                                            let victories = [];
                                                            let rankedStats = [];
                                                            let lanes = [];
                                                            let cellIds = [];
                                                            let selfLoc = 0;
                                                            let masteries = [];

                                                            if (cellLoc >= 5) {
                                                                selfLoc = cellLoc - 5
                                                            } else {
                                                                selfLoc = cellLoc
                                                            }

                                                            for (let i = 0; i < json["myTeam"].length; i++) {
                                                                let puuid = "";
                                                                let rankedStat = "";

                                                                $.ajax({
                                                                    type: "GET",
                                                                    async: false,
                                                                    dataType: 'json',
                                                                    url: riot_url + "/lol-summoner/v1/summoners/" + json["myTeam"][i]["summonerId"],
                                                                    success: function (data) {
                                                                        puuid = data["puuid"];
                                                                        puuids.push(puuid);

                                                                        $.ajax({
                                                                            type: 'GET',
                                                                            async: false,
                                                                            dataType: 'json',
                                                                            url: riot_url + '/lol-ranked/v1/ranked-stats/' + json["myTeam"][i]["summonerId"],
                                                                            success: function (data) {
                                                                                for (let q = 0; q < data["queues"].length; q++) {
                                                                                    let tmpRankedStat = [];
                                                                                    if (data["queues"][q]["queueType"] === "SOLO5V5") {
                                                                                        if (data["queues"][q]["tier"] === "NONE") {
                                                                                            rankedStat = "Unranked";
                                                                                        } else {
                                                                                            if (data["queues"][q]["division"] === "NA") {
                                                                                                tmpRankedStat = [data["queues"][q]["tier"], "", data["queues"][q]["leaguePoints"]];
                                                                                            } else {
                                                                                                tmpRankedStat = [data["queues"][q]["tier"], data["queues"][q]["division"], data["queues"][q]["leaguePoints"]];
                                                                                            }
                                                                                        }
                                                                                        rankedStats.push(tmpRankedStat);
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            }
                                                                        });

                                                                        // 롤 내부의 통계기능 이용하는데 작동 안함
                                                                        $.ajax({
                                                                            type: 'GET',
                                                                            async: false,
                                                                            dataType: 'json',
                                                                            url: riot_url + '/lol-career-stats/v1/summoner-games/' + puuid,
                                                                            success: function (data) {
                                                                                let cnt = 0;
                                                                                let cnt_10 = 0;
                                                                                let tmpGames = [];
                                                                                let tmpRecent = [];
                                                                                let won = 0;
                                                                                let tmpvictories = [];
                                                                                let tmplanes = {
                                                                                    "BOTTOM": 0,
                                                                                    "MID": 0,
                                                                                    "TOP": 0,
                                                                                    "JUNGLE": 0,
                                                                                    "SUPPORT": 0,
                                                                                    "UNKNOWN": 0,
                                                                                    "ALL": 0,
                                                                                    "NONE": 0
                                                                                };
                                                                                let tmpGames2 = [];

                                                                                data = data.reverse();
                                                                                for (let q = 0; q < data.length; q++) {
                                                                                    if (cnt === 20) {
                                                                                        break;
                                                                                    }

                                                                                    if (data[q]["queueType"] === "rank5solo") {
                                                                                        if (cnt_10 < 10) {
                                                                                            if (data[q]["stats"]['CareerStats.js']["victory"] === 1) {
                                                                                                won += 1;
                                                                                                tmpvictories.push(1);
                                                                                            } else {
                                                                                                tmpvictories.push(0);
                                                                                            }

                                                                                            tmplanes[data[q]["lane"]] += 1;
                                                                                        }

                                                                                        tmpGames.push(data[q]);
                                                                                        cnt += 1;
                                                                                        cnt_10 += 1;
                                                                                    }
                                                                                }
                                                                                lanes.push(tmplanes);
                                                                                victories.push(tmpvictories);
                                                                                recent20games.push(tmpGames);

                                                                                for (let q = 0; q < data.length; q++) {
                                                                                    if (data[q]["queueType"] === "rank5solo") {
                                                                                        tmpGames2.push(data[q]);
                                                                                    }
                                                                                }

                                                                                allGames.push(tmpGames2);
                                                                            }
                                                                        });

                                                                        $.ajax({
                                                                            type: 'GET',
                                                                            async: false,
                                                                            dataType: 'json',
                                                                            url: riot_url + '/lol-collections/v1/inventories/' + json["myTeam"][i]["summonerId"] + '/champion-mastery',
                                                                            success: function (data) {
                                                                                masteries.push(data);
                                                                            }
                                                                        });

                                                                        cellIds.push(json["myTeam"][i]["cellId"]);
                                                                        summonerNames.push(data["internalName"]);
                                                                        summonerLines.push(json["myTeam"][i]["assignedPosition"]);
                                                                    }
                                                                });
                                                            }

                                                            let summonerNamesString = JSON.stringify(summonerNames);
                                                            let summonerLinesString = JSON.stringify(summonerLines);
                                                            let cellIdsString = JSON.stringify(cellIds);
                                                            let rankedStatsString = JSON.stringify(rankedStats);
                                                            let recent20gamesString = JSON.stringify(recent20games);
                                                            let victoriesString = JSON.stringify(victories);
                                                            let lanesString = JSON.stringify(lanes);
                                                            let masteriesString = JSON.stringify(masteries);
                                                            let allGamesString = JSON.stringify(allGames);

                                                            chrome.tabs.executeScript(banpickTabId, {
                                                                "code": "var myScript = document.createElement('script');"
                                                                    + 'myScript.textContent = \'updateSummoner(' + summonerNamesString + ', ' + summonerLinesString + ', ' + cellIdsString + ', \"' + summonerNames[selfLoc] + '\", ' + selfLoc + ', ' + rankedStatsString + ', ' + recent20gamesString + ', ' + victoriesString + ', ' + lanesString + ', ' + masteriesString + ', ' + allGamesString + ');\';'
                                                                    + "document.head.appendChild(myScript);"
                                                            });

                                                            // console.log(`sName: ${summonerNames}, sLine: ${summonerLines}, cIds: ${cellIds}, sName: ${summonerNames[selfLoc]}, rankStat: ${rankedStats}, recent20: ${recent20games}, victories: ${victories}, lanes: ${lanes}, masteries: ${masteries}, all: ${allGames}`);
                                                        });
                                                    }
                                                }

                                                let prevEvent = "";
                                                for (let i = 0; i < actions.length; i++) {
                                                    let action = actions[i];
                                                    for (let k = 0; k < action.length; k++) {
                                                        let event = action[k];

                                                        if (prevActions) {
                                                            prevEvent = prevActions[i][k]
                                                        }

                                                        if (event["type"] === "ban") {
                                                            if (prevActions) {
                                                                if (event["completed"] !== prevEvent["completed"]) {
                                                                    if (myTeam.includes(event["actorCellId"])) {
                                                                        // console.log("ban", "my", event["championId"], event["actorCellId"]);
                                                                        updateBan(banpickTabId, "my", event["actorCellId"], event["championId"]);
                                                                    } else {
                                                                        // console.log("ban", "their", event["championId"], event["actorCellId"]);
                                                                        updateBan(banpickTabId, "their", event["actorCellId"], event["championId"]);
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        if (event["type"] === "pick") {
                                                            if (prevActions) {
                                                                if (event["completed"] !== prevEvent["completed"]) {
                                                                    if (myTeam.includes(event["actorCellId"])) {
                                                                        // console.log("pick", "my", event["championId"], event["actorCellId"]);
                                                                        updatePick(banpickTabId, "my", event["actorCellId"], event["championId"]);
                                                                    } else {
                                                                        // console.log("pick", "their", event["championId"], event["actorCellId"]);
                                                                        updatePick(banpickTabId, "their", event["actorCellId"], event["championId"]);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                prevActions = actions;
                                            }
                                        }
                                    }

                                    if (json["actions"].length !== 0) {
                                        for (let i = 0; i < json["actions"][0].length; i++) {
                                            // ranked game
                                            if (json["actions"][0][i]["type"] === "ban") {
                                                for (let k = 0; k < json["myTeam"].length; k++) {
                                                    if (json["myTeam"][k]["cellId"] === cellLoc) {
                                                        gameType = "ranked";
                                                        if(json["myTeam"][k]["championPickIntent"] === 0) {
                                                            for (let m = 0; m < json["actions"].length; m++) {
                                                                let champFound = false;
                                                                let isAram = false;
                                                                for (let n = 0; n < json["actions"][m].length; n++) {
                                                                    if (json["actions"][m][n]["type"] === "pick" && json["actions"][m][n]["actorCellId"] === cellLoc) {
                                                                        if(currentChampionId !== json["actions"][m][n]["championId"]) {
                                                                            currentChampionId = json["actions"][m][n]["championId"];

                                                                            let isUrf = false;

                                                                            if (currentGameQueueId === 900) {
                                                                                gameType = "urf";
                                                                                isUrf = true
                                                                            }

                                                                            let championName = openChampionTab(currentChampionId, lineType, gameType, isUrf);

                                                                            if (isAutoRuneAllowed) {
                                                                                if (summonerLevel >= minRuneLevel) {
                                                                                    updatePerkPages(championName);
                                                                                }

                                                                            }

                                                                            if (isItemRecommendAllowed) {
                                                                                parseChampion(championName, "item", currentChampionId);
                                                                            }

                                                                            champFound = true;
                                                                            isAram = false;

                                                                            break;
                                                                        }
                                                                    } else {
                                                                        isAram = true;
                                                                    }
                                                                }

                                                                // aram (special aram mode)
                                                                if (isAram) {
                                                                    if (json["myTeam"][k]["championId"] !== 0 && currentChampionId !== json["myTeam"][k]["championId"]) {
                                                                        gameType = "aram";
                                                                        currentChampionId = json["myTeam"][k]["championId"];
                                                                        let isUrf = false;

                                                                        if (currentGameQueueId === 900) {
                                                                            gameType = "urf";
                                                                            isUrf = true
                                                                        }
                                                                        let championName = openChampionTab(currentChampionId, lineType, gameType, isUrf);
                                                                        if (isAutoRuneAllowed) {
                                                                            if (summonerLevel >= minRuneLevel) {
                                                                                updatePerkPages(championName);
                                                                            }
                                                                        }

                                                                        if (isItemRecommendAllowed) {
                                                                            parseChampion(championName, "item", currentChampionId);
                                                                        }

                                                                        break;
                                                                    }
                                                                }

                                                                if (champFound) {
                                                                    break;
                                                                }
                                                            }
                                                        } else if (currentChampionId !== json["myTeam"][k]["championPickIntent"]) {
                                                            currentChampionId = json["myTeam"][k]["championPickIntent"];
                                                            let isUrf = false;

                                                            if (currentGameQueueId === 900) {
                                                                gameType = "urf";
                                                                isUrf = true
                                                            }
                                                            let championName = openChampionTab(currentChampionId, lineType, gameType, isUrf);
                                                            if (isAutoRuneAllowed) {
                                                                if (summonerLevel >= minRuneLevel) {
                                                                    updatePerkPages(championName);
                                                                }
                                                            }

                                                            if (isItemRecommendAllowed) {
                                                                parseChampion(championName, "item", currentChampionId);
                                                            }

                                                            break;
                                                        }
                                                    }
                                                }

                                                break;
                                            } else {
                                                // normal
                                                if (json["actions"][0][i]["actorCellId"] === cellLoc) {
                                                    if (currentChampionId !== json["actions"][0][i]["championId"]) {
                                                        currentChampionId = json["actions"][0][i]["championId"];
                                                        gameType = "normal";
                                                        let championName = openChampionTab(currentChampionId, lineType, gameType);
                                                        if (isAutoRuneAllowed) {
                                                            if (summonerLevel >= minRuneLevel) {
                                                                updatePerkPages(championName);
                                                            }
                                                        }

                                                        if (isItemRecommendAllowed) {
                                                            parseChampion(championName, "item", currentChampionId);
                                                        }

                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        // aram (normal aram mode)
                                        for (let i = 0; i < json["myTeam"].length; i++) {
                                            if(json["myTeam"][i]["cellId"] === cellLoc) {
                                                if (currentChampionId !== json["myTeam"][i]["championId"]) {
                                                    currentChampionId = json["myTeam"][i]["championId"];

                                                    let isUrf = false;
                                                    gameType = "aram";

                                                    if (currentGameQueueId === 900) {
                                                        gameType = "urf";
                                                        isUrf = true
                                                    }

                                                    let championName = openChampionTab(currentChampionId, lineType, gameType, isUrf);
                                                    if (isAutoRuneAllowed) {
                                                        if (summonerLevel >= minRuneLevel) {
                                                            updatePerkPages(championName, isUrf);
                                                        }
                                                    }

                                                    if (isItemRecommendAllowed) {
                                                        parseChampion(championName, "item", currentChampionId, isUrf);
                                                    }

                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    let roomName = json["chatDetails"]["chatRoomName"];
                                    if(roomName !== prevRoomName) {
                                        chrome.windows.getAll(function(windows) {
                                            if (windows.length === 0) {
                                                chrome.windows.create({url: "chrome://newtab"});
                                            }
                                            if (gameType === "") {
                                                gameType = "normal";
                                            }

                                            if (isMultisearchAllowed) {
                                                _gaq.push(['_trackEvent', 'multisearch_'+gameType, 'opened']);

                                                let summonerid_one = "";
                                                myTeam = json["myTeam"];
                                                for (let i = 0; i < myTeam.length; i++) {
                                                    let summonerId = myTeam[i]["summonerId"];

                                                    $.ajax({
                                                        type: "GET",
                                                        async: false,
                                                        dataType: 'json',
                                                        url: riot_url+"/lol-summoner/v1/summoners/"+summonerId,
                                                        success: function(json) {
                                                            let internalName = json["internalName"];
                                                            summonerid_one += internalName + ", ";
                                                        }
                                                    });
                                                }

                                                if (multiSearchTabId === 0) {
                                                    chrome.tabs.create({url: "https://"+region+".op.gg/multi/query="+summonerid_one}, function(newTab) {
                                                        multiSearchTabId = newTab.id;
                                                    });
                                                } else {
                                                    chrome.tabs.update(multiSearchTabId, {url: "https://"+region+".op.gg/multi/query="+summonerid_one, active:true, highlighted:true});
                                                }
                                            }
                                        });

                                        prevRoomName = roomName;
                                    }
                                }
                            }
                        },
                        error: function(res) {
                            // Game Not Started
                            chrome.storage.local.set({fileurl: true});
                            chrome.storage.local.set({localhost: "on"});

                            currentChampionId = 0;
                            prevRoomName = "";
                            currentGameQueueId = 0;
                            prevActions = "";
                            isFirstRun = true;
                            tftMode = 0;
                        }
                    });
                }
            });
        },
        error: function(res) {
            clearInterval(r);
            r = null;
            t = setInterval(isLeagueClientOpened, refresh_rate);
        }
    });
}

function isLeagueClientOpened() {
    $.ajax({
        type: "GET",
        url: "file://"+riot_path+"/Logs/LeagueClient Logs",
        success: function(res) {
            chrome.storage.local.set({fileurl: true});
            files = res.split('<script>addRow("');
            for(let i = files.length-1; i > files.length-8; i--) {
                let file = files[i].split('"')[0];
                if(file.indexOf('LeagueClientUx.log') > 0) {
                    $.ajax({
                        type: "GET",
                        url: "file://"+riot_path+"/Logs/LeagueClient Logs/"+file,
                        success: function(res) {
                            try {
                                riot_url = res.split('https://riot:')[1].split('/')[0];
                                riot_url = 'https://riot:'+riot_url;
                                $.ajax({
                                    type: "GET",
                                    url: riot_url+"/riotclient/auth-token",
                                    success: function(res) {
                                        chrome.storage.local.set({localhost: "on"});
                                        r = setInterval(function() { leagueClientRunning(riot_url); }, refresh_rate);
                                        clearInterval(t);
                                        t = null;
                                    },
                                    error: function(res, status, error) {
                                        currentSummoner = {};
                                        prevRoomName = "";
                                    }
                                });
                            }
                            catch(err) {
                            }
                        }
                    });

                    break;
                }
            }
        },
        error: function(err) {
            if (directoryWrong === false && isFileUrlAllowed === true) {
                directoryWrong = true;
            }
        }
    });
}

chrome.runtime.getPlatformInfo(function(info) {
    if (info.os === "win") {
        chrome.storage.local.get(['riot_path'], function(data) {
            if (data.riot_path == null) {
                chrome.storage.local.set({riot_path: riot_path});
            } else {
                riot_path = data.riot_path;
            }
        });
    } else if (info.os === "mac") {
        riot_path = "/Applications/League of Legends.app/Contents/LoL";
    } else {
        console.log("os not supported");
    }
});

chrome.storage.local.get(['region'], function(data) {
    if (data.region === "detection") {
        region = "";
    } else if (data.region === "asdasd") {
        chrome.storage.local.get(['notice_kr_server_down'], function(data) {
            if (data.notice_kr_server_down === 1 || data.notice_kr_server_down === undefined) {
                chrome.storage.local.set({notice_kr_server_down: 0});
                // chrome.tabs.create({url: "https://talk.op.gg/s/lol/opgg/959208"}, function(newTab) {});
            }
        });
        region = data.region;
    } else if (data.region != null) {
        region = data.region;
    }
});

chrome.storage.local.get(['state'], function(data) {
    if (data.state == null) {
        chrome.storage.local.set({state: 'on'});
        t = setInterval(isLeagueClientOpened, refresh_rate);
    } else if (data.state === "on") {
        t = setInterval(isLeagueClientOpened, refresh_rate);
    }
});

chrome.storage.local.get(['rune'], function(data) {
    if (data.rune == null) {
        chrome.storage.local.set({rune: 'off'});
    } else if (data.rune === "off") {
        isAutoRuneAllowed = false;
    } else {
        isAutoRuneAllowed = true;
    }
});

chrome.storage.local.get(['multisearch'], function(data) {
    if (data.multisearch == null) {
        chrome.storage.local.set({multisearch: 'on'});
    } else if (data.multisearch === "off") {
        isMultisearchAllowed = false;
    }
});

chrome.storage.local.get(['champion'], function(data) {
    if (data.champion == null) {
        chrome.storage.local.set({champion: 'on'});
    } else if (data.champion === "off") {
        isChampionAllowed = false;
    }
});

chrome.storage.local.get(['items'], function(data) {
    if (data.items == null) {
        chrome.storage.local.set({items: 'off'});
    } else if (data.items === "off") {
        isItemRecommendAllowed = false;
    } else {
        isItemRecommendAllowed = true;
    }
});

chrome.storage.local.get(['ban'], function(data) {
	if (data.ban == null) {
        chrome.storage.local.set({ban: 'on'});
    } else if (data.ban === "off") {
        isBanAllowed = false;
    } else {
        isBanAllowed = true;
    }
});

chrome.storage.local.get(['refresh_rate'], function(data) {
    if (data.refresh_rate == null) {
        chrome.storage.local.set({
            "refersh_rate": 2000
        });
        refresh_rate = 2000;
    } else {
        refresh_rate = data.refresh_rate;
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'ext_off') {
        chrome.storage.local.set({state: 'off'});
        clearInterval(t);
        t = null;

        clearInterval(r);
        r = null;
    } else if (request.cmd === 'ext_on') {
        chrome.storage.local.set({state: 'on'});
        t = setInterval(isLeagueClientOpened, refresh_rate);
    } else if (request.cmd === 'changeDirectory') {
        riot_path = request.data.riot_path;
        clearInterval(t);
        t = null;

        clearInterval(r);
        r = null;
        t = setInterval(isLeagueClientOpened, refresh_rate);
    } else if (request.cmd === "changeRegion") {
        region = request.data.region;
        if (region === "detection") {
            region = "";
        }
    } else if (request.cmd === "rune_on") {
        isAutoRuneAllowed = true;
    } else if (request.cmd === "rune_off") {
        isAutoRuneAllowed = false;
    } else if (request.cmd === "multi_on") {
        isMultisearchAllowed = true;
    } else if (request.cmd === "multi_off") {
        isMultisearchAllowed = false;
    } else if (request.cmd === "champ_on") {
        isChampionAllowed = true;
    } else if (request.cmd === "champ_off") {
        isChampionAllowed = false;
    } else if (request.cmd === "items_on") {
        isItemRecommendAllowed = true;
    } else if (request.cmd === "items_off") {
        isItemRecommendAllowed = false;
    } else if (request.cmd === "ban_on") {
    	isBanAllowed = true;
    } else if (request.cmd === "ban_off") {
    	isBanAllowed = false;
    } else if (request.cmd === "refresh-rate-changed") {
        clearInterval(t);
        t = null;
        clearInterval(r);
        r = null;
        chrome.storage.local.get(['refresh_rate'], function(data) {
            if (data.refresh_rate == null) {
                chrome.storage.local.set({
                    "refersh_rate": 2000
                });
                refresh_rate = 2000;
                t = setInterval(isLeagueClientOpened, data.refresh_rate);
            } else {
                refresh_rate = data.refresh_rate;
                t = setInterval(isLeagueClientOpened, data.refresh_rate);
            }
        });
    }
});

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.get(tabId.tabId, function(tab) {
        // console.log(tab);
        if (tab.status === "loading") {
            if (tab.pendingUrl.indexOf("op.gg/champion") > 0) {
                championSearchTabId = tab.id;
                // console.log("champion tab");
            } else if (tab.pendingUrl.indexOf("op.gg/multi") > 0) {
                multiSearchTabId = tab.id;
                // console.log("multi tab");
            } else if (tab.pendingUrl.indexOf("op.gg/banpick") > 0) {
                banpickTabId = tab.id;
                // console.log("banpick tab");
            }
        }
    });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    switch (tabId) {
        case multiSearchTabId:
            multiSearchTabId = 0;
            break;

        case championSearchTabId:
            championSearchTabId = 0;
            break;

        case settingsTabId:
            settingsTabId = 0;
            break;

        case banpickTabId:
            banpickTabId = 0;
            break;
    }
});

chrome.webRequest.onErrorOccurred.addListener(function(details) {
    if (details["error"] === "net::ERR_CONNECTION_REFUSED") {
        isSettingMessage = false;
    } else if (details["error"] === "net::ERR_CERT_AUTHORITY_INVALID") {
        isLocalhostAllowed = false;
        chrome.storage.local.set({localhost: "off"});

        if (!isSettingMessage) {
            alert(chrome.i18n.getMessage("checkSettings"));
            isSettingMessage = true;
        }
    }
}, {urls: ["https://127.0.0.1:*/*"]});

chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
    if (!isAllowedAccess) {
        chrome.storage.local.set({fileurl: false});
        if (!isSettingMessage2) {
            alert(chrome.i18n.getMessage("checkSettings"));
            isSettingMessage2 = true;
        }
    } else {
        isSettingMessage2 = false;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	if (request) {
		if (request.message) {
			if (request.message === "version") {
				sendResponse({version: chrome.runtime.getManifest().version});
			} else if(request.message === "addFriend") {

				let freindRequest = {
					"direction": "in",
					"id": 0,
					"name": request.summoner,
					"note": ""
				}
				freindRequest = JSON.stringify(freindRequest);

				$.ajax({
					type: 'POST',
					dataType: 'json',
					data: freindRequest,
					contentType: 'application/json',
					processData: false,
					url: riot_url+'/lol-chat/v1/friend-requests',
					success: function(json) {
						// console.log(json);
					},
					error: function(json) {

					}
				});

			}
		}
	}
	return true;
});