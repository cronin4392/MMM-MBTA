Module.register("MMM-MBTA", {
    defaults: {
        apikey: "",
        updateInterval: 10, // In seconds
        baseUrl: "https://api-v3.mbta.com/",
        stations: [ "Northeastern University" ],
        direction: [ ],
        predictedTimes: true,
        doAnimation: false,
        animationSpeed: 1000,
        formatETA: true,
        showMinutesOnly: false,
        showOnly: [ ],
        maxEntries: 8,
        maxTime: 0,
        showArrivalTime: false,
        showDepartTime: false,
        showETATime: true,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        showFullName: false,
        colorIcons: false,
        showAlerts: false,
        hideEmptyAlerts: false
    },
    
    getStyles: function() {
        return ["font-awesome.css", "MMM-MBTA.css"];
    },
    
    getHeader: function() {
        return this.data.header + " " + this.config.stations[0];
    },
    
    getScripts: function () {
        return ["moment.js", "https://code.jquery.com/jquery-3.3.1.min.js"];
    },
    
    start: function() {
        // API abuse prevention
        if (this.config.updateInterval < 10) {
            this.config.updateInterval = 10;
        }
        
        this.loaded = false;
        // Dictionary sincerely stolen from https://github.com/mbtaviz/mbtaviz.github.io/
        // and green line dictionary data taken from https://github.com/mbtaviz/green-line-release/
        // TODO: Get from external file
        var stationDict = {"Airport": "place-aport", "Alewife": "place-alfcl", "Allston Street": "place-alsgr", "Andrew Square": "place-andrw", "Aquarium": "place-aqucl", "Arlington": "place-armnl", "Ashmont": "place-asmnl", "Assembly": "place-astao", "Babcock Street": "place-babck", "Back Bay": "place-bbsta", "Back of the Hill": "place-bckhl", "Beachmont": "place-bmmnl", "Beaconsfield": "place-bcnfd", "Blandford Street": "place-bland", "Boston College": "place-lake", "Boston University Central": "place-bucen", "Boston University East": "place-buest", "Boston University West": "place-buwst", "Bowdoin": "place-bomnl", "Boylston": "place-boyls", "Braintree": "place-brntn", "Brandon Hall": "place-bndhl", "Brigham Circle": "place-brmnl", "Broadway": "place-brdwy", "Brookline Hills": "place-brkhl", "Brookline Village": "place-bvmnl", "Butler": "place-butlr", "Capen Street": "place-capst", "Cedar Grove": "place-cedgr", "Central Avenue": "place-cenav", "Central Square": "place-cntsq", "Charles/MGH": "place-chmnl", "Chestnut Hill Avenue": "place-chill", "Chestnut Hill": "place-chhil", "Chinatown": "place-chncl", "Chiswick Road": "place-chswk", "Cleveland Circle": "place-clmnl", "Community College": "place-ccmnl", "Coolidge Corner": "place-cool", "Copley": "place-coecl", "Davis Square": "place-davis", "Dean Road": "place-denrd", "Downtown Crossing": "place-dwnxg", "Eliot": "place-eliot", "Englewood Avenue": "place-engav", "Fairbanks Street": "place-fbkst", "Fenway": "place-fenwy", "Fenwood Road": "place-fenwd", "Fields Corner": "place-fldcr", "Forest Hills": "place-forhl", "Government Center": "place-gover", "Green Street": "place-grnst", "Griggs Street": "place-grigg", "Harvard Avenue": "place-harvd", "Harvard Square": "place-harsq", "Hawes Street": "place-hwsst", "Haymarket": "place-haecl", "Heath Street": "place-hsmnl", "Hynes Convention Center": "place-hymnl", "Jackson Square": "place-jaksn", "JFK/UMass": "place-jfk", "Kendall/MIT": "place-knncl", "Kenmore": "place-kencl", "Kent Street": "place-kntst", "Lechmere": "place-lech", "Longwood": "place-longw", "Longwood Medical Area": "place-lngmd", "Malden Center ": "place-mlmnl", "Mass Ave": "place-masta", "Mattapan": "place-matt", "Maverick": "place-mvbcl", "Milton": "place-miltt", "Mission Park": "place-mispk", "Museum of Fine Arts": "place-mfa", "Newton Centre": "place-newto", "Newton Highlands": "place-newtn", "North Quincy": "place-nqncy", "North Station": "place-north", "Northeastern University": "place-nuniv", "Oak Grove": "place-ogmnl", "Orient Heights": "place-orhte", "Packards Corner": "place-brico", "Park Street": "place-pktrm", "Pleasant Street": "place-plsgr", "Porter Square": "place-portr", "Prudential": "place-prmnl", "Quincy Adams": "place-qamnl", "Quincy Center": "place-qnctr", "Reservoir": "place-rsmnl", "Revere Beach": "place-rbmnl", "Riverside": "place-river", "Riverway": "place-rvrwy", "Roxbury Crossing": "place-rcmnl", "Ruggles": "place-rugg", "Saint Marys Street": "place-smary", "Saint Paul Street - B": "place-stplb", "Saint Paul Street - C": "place-stpul", "Savin Hill": "place-shmnl", "Science Park": "place-spmnl", "Shawmut": "place-smmnl", "South Station": "place-sstat", "South Street": "place-sougr", "State Street": "place-state", "Stony Brook": "place-sbmnl", "Suffolk Downs": "place-sdmnl", "Sullivan Square": "place-sull", "Summit Avenue": "place-sumav", "Sutherland Road": "place-sthld", "Symphony": "place-symcl", "Tappan Street": "place-tapst", "Tufts Medical Center": "place-tumnl", "Valley Road": "place-valrd", "Waban": "place-waban", "Warren Street": "place-wrnst", "Washington Square": "place-bcnwa", "Washington Street": "place-wascm", "Wellington ": "place-welln", "Wollaston": "place-wlsta", "Wonderland": "place-wondl", "Wood Island": "place-wimnl", "Woodland": "place-woodl", "Abington": "Abington", "Anderson/Woburn": "Anderson%2F%20Woburn", "Andover": "Andover", "Ashland": "Ashland", "Attleboro": "Attleboro", "Auburndale": "Auburndale", "Ayer": "Ayer", "Ballardvale": "Ballardvale", "Bellevue": "Bellevue", "Belmont": "Belmont", "Beverly Farms": "Beverly%20Farms", "Beverly": "Beverly", "Boston Landing": "Boston%20Landing", "Bradford": "Bradford", "Brandeis/Roberts": "Brandeis%2F%20Roberts", "Bridgewater": "Bridgewater", "Brockton": "Brockton", "Campello": "Campello", "Canton Center": "Canton%20Center", "Canton Junction": "Canton%20Junction", "Chelsea": "Chelsea", "Cohasset": "Cohasset", "Concord": "Concord", "Dedham Corp Center": "Dedham%20Corp%20Center", "East Weymouth": "East%20Weymouth", "Endicott": "Endicott", "Fairmount": "Fairmount", "Fitchburg": "Fitchburg", "Forge Park/495": "Forge%20Park%20%2F%20495", "Four Corners/Geneva": "Four%20Corners%20%2F%20Geneva", "Foxboro": "Foxboro", "Framingham": "Framingham", "Franklin": "Franklin", "Gloucester": "Gloucester", "Grafton": "Grafton", "Greenbush": "Greenbush", "Greenwood": "Greenwood", "Halifax": "Halifax", "Hamilton/Wenham": "Hamilton%2F%20Wenham", "Hanson": "Hanson", "Hastings": "Hastings", "Haverhill": "Haverhill", "Hersey": "Hersey", "Highland": "Highland", "Holbrook/Randolph": "Holbrook%2F%20Randolph", "Hyde Park": "Hyde%20Park", "Ipswich": "Ipswich", "Islington": "Islington", "Kendal Green": "Kendal%20Green", "Kingston": "Kingston", "Lawrence": "Lawrence", "Lincoln": "Lincoln", "Littleton/Rte 495": "Littleton%20%2F%20Rte%20495", "Lowell": "Lowell", "Lynn": "Lynn", "Manchester": "Manchester", "Mansfield": "Mansfield", "Melrose Cedar Park": "Melrose%20Cedar%20Park", "Melrose Highlands": "Melrose%20Highlands", "Middleborough/Lakeville": "Middleborough%2F%20Lakeville", "Mishawum": "Mishawum", "Montello": "Montello", "Montserrat": "Montserrat", "Morton Street": "Morton%20Street", "Nantasket Junction": "Nantasket%20Junction", "Natick Center": "Natick%20Center", "Needham Center": "Needham%20Center", "Needham Heights": "Needham%20Heights", "Needham Junction": "Needham%20Junction", "Newburyport": "Newburyport", "Newmarket": "Newmarket", "Newtonville": "Newtonville", "Norfolk": "Norfolk", "North Beverly": "North%20Beverly", "North Billerica": "North%20Billerica", "North Leominster": "North%20Leominster", "North Scituate": "North%20Scituate", "North Wilmington": "North%20Wilmington", "Norwood Central": "Norwood%20Central", "Norwood Depot": "Norwood%20Depot", "Plimptonville": "Plimptonville", "Plymouth": "Plymouth", "Prides Crossing": "Prides%20Crossing", "Providence": "Providence", "Reading": "Reading", "Readville": "Readville", "Rockport": "Rockport", "Roslindale Village": "Roslindale%20Village", "Route 128": "Route%20128", "Rowley": "Rowley", "Salem": "Salem", "Sharon": "Sharon", "Shirley": "Shirley", "Silver Hill": "Silver%20Hill", "South Acton": "South%20Acton", "South Attleboro": "South%20Attleboro", "South Weymouth": "South%20Weymouth", "Southborough": "Southborough", "Stoughton": "Stoughton", "Swampscott": "Swampscott", "Talbot Avenue": "Talbot%20Avenue", "TF Green Airport": "TF%20Green%20Airport", "Uphams Corner": "Uphams%20Corner", "Wachusett": "Wachusett", "Wakefield": "Wakefield", "Walpole": "Walpole", "Waltham": "Waltham", "Waverley": "Waverley", "Wedgemere": "Wedgemere", "Wellesley Farms": "Wellesley%20Farms", "Wellesley Hills": "Wellesley%20Hills", "Wellesley Square": "Wellesley%20Square", "West Concord": "West%20Concord", "West Gloucester": "West%20Gloucester", "West Hingham": "West%20Hingham", "West Medford": "West%20Medford", "West Natick": "West%20Natick", "West Newton": "West%20Newton", "West Roxbury": "West%20Roxbury", "Westborough": "Westborough", "Weymouth Landing/East Braintree": "Weymouth%20Landing%2F%20East%20Braintree", "Whitman": "Whitman", "Wickford Junction": "Wickford%20Junction", "Wilmington": "Wilmington", "Winchester Center": "Winchester%20Center", "Windsor Gardens": "Windsor%20Gardens", "Worcester": "Worcester", "Wyoming Hill": "Wyoming%20Hill", "Yawkey": "Yawkey", "1042 Trapelo Rd": "8930", "1045 Trapelo Rd @ Sovereign Bank": "17774", "1079 Commonwealth Ave": "959", "1114 Main St opp Malone St": "86934", "112 Walter St opp Cotton St": "1858", "113 Crescent St": "7814", "1164 Main St opp Edgehill Rd": "86933", "125 Western Ave": "1068", "130 Lexington St @ Shopping Plaza": "7795", "130 Western Ave": "1052", "132 Brookline Ave opp Fullerton St": "1562", "135 Beaver St.": "78600", "144 Walter St opp Mendum St": "1857", "145 Grove St opp Bellingham Rd": "11836", "156 Oak St": "82033", "16 Eliot St": "2565", "1600 Washington St": "78216", "161 Lexington St": "78202", "170 Walter St": "1856", "173 Oak St": "81464", "175 Wyman St": "89612", "180 Lexington St": "7836", "181 Lexington St": "78203", "184 Hammond St": "77241", "19 Brighton Ave": "960", "200 Parker St opp Stearns St": "8500", "210 Nahanton St": "85289", "211 Bear Hill Rd": "17009", "254 South St": "7603", "260 Forest St": "78610", "271 Waverley Oaks Rd": "78601", "277 Belgrade Ave opp Rexhame St": "802", "280 Boylston St": "17001", "286 Independence Dr": "1890", "286 Independence Dr": "61836", "288 Parker St opp Parker Ave": "8498", "293 Bear Hill Rd": "17008", "293 Second Ave": "17003", "30 Prospect St": "2531", "300 Bear Hill Rd": "17006", "31 Walter St opp Sheffield St": "1869", "310 Corey St": "1840", "325 Boylston St": "17000", "350 Washington St": "6539", "36 Hammond St": "77245", "36 Trapelo Rd": "2107", "367 Western Ave opp Brighton Mills Mall": "1074", "37 Elm St": "7620", "380 Trapelo Rd": "78625", "3867 Washington St opp Tollgate Way": "596", "40 Second Ave - Mass General West": "17007", "400 Centre St": "9031", "400 Totten Pond Rd": "18931", "404 Wyman St": "18924", "43 W Dedham St": "1382", "440 Totten Pond Rd": "18932", "445 Western Ave": "1076", "45 Dale St": "7863", "450 Western Ave": "1045", "48 Woerd Ave": "7842", "498 Watertown St": "9492", "5 Charles Park Rd": "10830", "5 Walter St opp Hewlett St": "11868", "500 Arsenal St - Watertown + Arsenal Mall": "1438", "503 Watertown St": "8188", "540 Pleasant St": "7853", "541 Pleasant St": "78071", "555 Pleasant St": "7482", "570 Pleasant St": "7580", "59 South St": "89339", "590 Main St opp Herson St": "8292", "60 Western Ave": "1053", "617 Lexington St - Waltham HS": "8910", "64 South St": "76051", "650 VFW Pkwy": "1889", "677 Winchester St": "84881", "678 Brookline Ave opp Pearl St": "1556", "69 Lincoln St": "8204", "691 Main St": "88334", "7 Winship St": "1301", "700 Pleasant St": "78512", "702 Main St": "86942", "75 Chapel St": "7855", "78 Chapel St": "7805", "785 Centre St": "8522", "790 Centre St": "8511", "791 Walnut St": "8198", "796 Walnut St": "8159", "83 Lasell St opp Atlantis St": "836", "835 Huntington Ave opp Parker Hill Ave": "1365", "850 Boylston St": "1543", "910 Boylston St": "1542", "940 Walnut St": "81562", "976 Lexington St": "89301", "Aberdeen Ave @ Mt Auburn St": "2077", "Aberdeen Ave @ Mt Auburn St": "2098", "Adams St @ Lincoln Rd": "7858", "Adams St @ Middle St": "7801", "Adams St @ Quirk St": "78571", "Adams St @ Washington St": "7800", "Adams St @ Washington St": "78573", "Adams St @ Watertown St": "7802", "Arlington St @ Saint James Ave": "145", "Arsenal St @ Arlington St": "1443", "Arsenal St @ Beacon Pk": "1433", "Arsenal St @ Beechwood Ave": "1434", "Arsenal St @ Elm St": "1444", "Arsenal St @ Irving St": "1432", "Arsenal St @ Irving St": "1452", "Arsenal St @ Louise St": "1435", "Arsenal St @ School St": "1448", "Arsenal St @ Talcott Ave": "1437", "Arsenal St @ Watertown + Arsenal Mall": "1445", "Arsenal St opp Arlington St": "1442", "Arsenal St opp Beacon Pk": "1451", "Arsenal St opp Beechwood Ave": "1450", "Arsenal St opp Elm St": "1441", "Arsenal St opp Louise St": "1449", "Arsenal St opp School St": "1436", "Arsenal St opp Talcott Ave": "1447", "Arsenal St opp VFW Post 1105": "14481", "Arthur St @ Guest St - Stop & Shop": "11071", "Arthur St @ Guest St - Stop & Shop": "11971", "Ave Louis Pasteur @ Longwood Ave": "11780", "Ave Louis Pasteur @ Longwood Ave": "11802", "Ave Louis Pasteur @ The Fenway": "11781", "Ave Louis Pasteur @ The Fenway": "11799", "Back Bay Station": "23391", "Bacon St @ Athletic Field Rd": "7718", "Bacon St @ Clark Ln": "1606", "Bacon St @ Dale St": "1609", "Bacon St @ Greenwood Ln": "1607", "Bacon St @ Kendall Pk": "1608", "Bacon St @ Pond St": "8383", "Bacon St @ School St": "8901", "Bacon St @ Varnum Pk": "8904", "Bacon St opp Clark Ln": "8906", "Bacon St opp Greenwood Ln": "8905", "Baker St @ Amesbury St": "85566", "Baker St @ Beth El Cemetery": "8472", "Baker St @ Beth El Cemetery": "8557", "Baker St @ Capital St": "85564", "Baker St @ Cutter Rd": "8392", "Baker St @ Cutter Rd": "85567", "Baker St @ Dunwell St": "85568", "Baker St @ Gethsemane Cemetery": "85561", "Baker St @ Lasell St": "833", "Baker St @ Rumford Rd": "8393", "Baker St @ Varick Rd": "8394", "Baker St @ VFW Pkwy": "8473", "Baker St @ VFW Pkwy": "85562", "Baker St @ VFW Pkwy": "85563", "Baker St @ Wycliff Ave": "85569", "Baker St opp Dunwell St": "8391", "Baker St opp Gethsemane Cemetery": "84731", "Baker St opp Varick Rd": "85565", "Baker St opp Wycliff Ave": "8390", "Beacon St @ Washington St": "2435", "Beacon St @ Washington St": "2455", "Bear Hill Rd opp Second Ave": "17005", "Beaver St @ Field Rd": "7498", "Beaver St @ Forest St": "7698", "Beaver St @ Linden St": "74981", "Beaver St @ Linden St": "9518", "Beaver St @ Valley View Rd": "7700", "Beaver St @ Valley View Rd": "7865", "Beaver St @ Warren St": "7579", "Beaver St @ Warren St": "7696", "Beaver St @ Waverley Oak Rd": "7697", "Beaver St @ Waverley Oaks Rd": "7578", "Beaver St opp Field Rd": "7699", "Beaver St opp Forest St": "7497", "Bedford St @ Chauncy St": "16538", "Belgrade Ave @ Aldrich St": "790", "Belgrade Ave @ Centre St": "786", "Belgrade Ave @ Centre St": "805", "Belgrade Ave @ Corinth St": "794", "Belgrade Ave @ Iona St": "788", "Belgrade Ave @ McGraw St": "803", "Belgrade Ave @ Penfield St": "792", "Belgrade Ave @ Pinehurst St": "793", "Belgrade Ave @ Rexhame St": "789", "Belgrade Ave @ Robert St": "797", "Belgrade Ave @ Walworth St": "791", "Belgrade Ave @ Walworth St": "800", "Belgrade Ave @ West Roxbury Pkwy": "787", "Belgrade Ave @ West Roxbury Pkwy": "804", "Belgrade Ave opp Aldrich St": "801", "Belgrade Ave opp Penfield St": "799", "Belgrade Ave opp Pinehurst St": "798", "Belmont St @ Cushing St": "2118", "Belmont St @ Duff St": "77051", "Belmont St @ Falmouth St": "2122", "Belmont St @ Langdon Ave": "2112", "Belmont St @ Lexington St": "17711", "Belmont St @ Marlboro St": "2121", "Belmont St @ Oakley Rd": "2125", "Belmont St @ Payson Rd": "2124", "Belmont St @ Prentiss St": "2115", "Belmont St @ School St": "2123", "Belmont St @ St. Mary's St": "2117", "Belmont St @ Sullivan Rd": "2119", "Belmont St @ Woodleigh Rd": "2113", "Belmont St opp Duff St": "77110", "Belmont St opp Payson St": "2110", "Birmingham Pkwy @ Soldiers Field Rd": "1204", "Boylston St @ Berkeley St": "144", "Boylston St @ Chestnut Hill Ave": "1535", "Boylston St @ Clarendon St": "143", "Boylston St @ Clark Rd": "1533", "Boylston St @ Dartmouth St": "175", "Boylston St @ Hammond St": "1540", "Boylston St @ Hammond St": "1984", "Boylston St @ Heath St": "1545", "Boylston St @ Kennard Rd": "1547", "Boylston St @ Massachusetts Ave": "11391", "Boylston St @ Norfolk Rd": "1539", "Boylston St @ Randolph Rd": "1541", "Boylston St @ Reservoir Rd": "1536", "Boylston St @ Saint Cecilia St": "1932", "Boylston St @ Star Market - Service Rd": "1965", "Boylston St @ Sumner Rd": "1534", "Boylston St @ Timon Ave": "15351", "Boylston St @ Tully St": "19821", "Boylston St @ Warren St": "1546", "Brighton Ave @ Allston St": "927", "Brighton Ave @ Cambridge St": "926", "Brighton Ave @ Comm Ave": "931", "Brighton Ave @ Harvard Ave": "928", "Brighton Ave @ Linden St": "929", "Brighton Ave @ Linden St": "962", "Brighton Ave opp Quint Ave": "964", "Broadway @ Columbia St": "24483", "Broadway @ Columbia St": "24488", "Broadway @ Galileo Way": "2228", "Broadway @ Hampshire St": "24486", "Broadway @ Norfolk St": "24482", "Broadway @ Norfolk St": "24489", "Broadway @ Prospect St": "24481", "Broadway @ Prospect St": "24490", "Broadway @ Windsor St": "24484", "Broadway @ Windsor St": "24487", "Broadway opp Hampshire St": "24485", "Brookline Ave @ Aspinwall Ave": "1524", "Brookline Ave @ Boylston St": "9441", "Brookline Ave @ Deaconess Rd": "1559", "Brookline Ave @ Francis St": "1523", "Brookline Ave @ Francis St": "1558", "Brookline Ave @ Fullerton St": "1519", "Brookline Ave @ Longwood Ave": "1521", "Brookline Ave @ Longwood Ave": "1804", "Brookline Ave @ Newbury St": "1564", "Brookline Ave @ Park Dr": "1520", "Brookline Ave @ Pearl St": "1525", "Brookline Ave @ Pilgrim Rd": "1777", "Brookline Ave @ Short St": "1778", "Brookline Ave @ The Fenway": "1806", "Brookline Ave @ Yawkey Way": "1563", "Brookline Ave opp Aspinwall Ave": "1557", "Brookline Ave opp Newbury St": "8993", "Brookline Ave opp Short St": "1805", "Brookline Ave opp Yawkey Way": "1518", "Brookline St @ Green St": "1816", "California St @ Bridge St": "7806", "California St @ Bridge St": "7854", "Cambridge St @ Barrows St": "925", "Cambridge St @ Bowdoin St": "49702", "Cambridge St @ Brighton St": "2757", "Cambridge St @ Carter St": "2779", "Cambridge St @ Center Plaza - Gov't Ctr": "49703", "Cambridge St @ Craftsman St": "1111", "Cambridge St @ Dustin St": "969", "Cambridge St @ Elko St": "971", "Cambridge St @ Emery Rd": "1195", "Cambridge St @ Franklin St": "1193", "Cambridge St @ Gordon St": "924", "Cambridge St @ Harvard Ave": "1112", "Cambridge St @ Lincoln St": "1191", "Cambridge St @ Linden St": "1113", "Cambridge St @ Maffa Way": "2842", "Cambridge St @ Mass Pike Exit": "1116", "Cambridge St @ Mass Pike": "1189", "Cambridge St @ N Beacon St": "966", "Cambridge St @ N Harvard St": "1114", "Cambridge St @ Parker St": "2758", "Cambridge St @ Saltonstall Bldg - Bowdoin Sq": "28310", "Cambridge St @ Saunders St": "967", "Cambridge St @ Seattle St": "1115", "Cambridge St @ Seattle St": "1190", "Cambridge St @ Sparhawk St": "970", "Cambridge St @ Washington St": "920", "Cambridge St opp Dustin St": "922", "Cambridge St opp Elko St": "19201", "Carter St @ Waltham Comm Rail Sta": "86944", "Carter St opp Commuter Rail Station": "88333", "Central Ave @ Gould St": "81447", "Central Ave @ Gould St": "82135", "Central Ave @ Hampton Ave": "81448", "Central Ave @ Noanette Rd": "81446", "Central Ave @ Parkland Rd": "82130", "Central Ave @ Reservoir St": "81449", "Central Ave @ Reservoir St": "82133", "Central Ave @ Saint Mary St": "82134", "Centre St @ Alderwood Rd": "8509", "Centre St @ Beacon St": "8504", "Centre St @ Beacon St": "8528", "Centre St @ Bellevue St": "8519", "Centre St @ Bowen St": "8527", "Centre St @ Cabot St": "8521", "Centre St @ Church St": "8516", "Centre St @ Church St": "8517", "Centre St @ Clark St": "84887", "Centre St @ Commonwealth Ave": "8507", "Centre St @ Commonwealth Ave": "8526", "Centre St @ Corey St": "784", "Centre St @ Corey St": "807", "Centre St @ Cotton St": "8510", "Centre St @ Cotton St": "8523", "Centre St @ Cushing St": "85282", "Centre St @ George St": "8513", "Centre St @ Gibbs St": "8506", "Centre St @ Hyde Ave": "8514", "Centre St @ Hyde St": "85290", "Centre St @ Jefferson St": "988", "Centre St @ Lagrange St": "781", "Centre St @ Langley Rd": "8505", "Centre St @ Locksley Rd": "84888", "Centre St @ Locksley Rd": "85281", "Centre St @ Lombard St": "8520", "Centre St @ Lorette St": "821", "Centre St @ Manthorne St": "15256", "Centre St @ Mill St": "8524", "Centre St @ Newtonville Ave": "8515", "Centre St @ Newtonville Ave": "8518", "Centre St @ Park St": "783", "Centre St @ Pearl St": "1900", "Centre St @ Saint Theresa Ave": "780", "Centre St @ Sargent St": "8512", "Centre St @ Spring St": "811", "Centre St @ Walnut St": "84886", "Centre St @ Walnut St": "85283", "Centre St @ Ward St": "8508", "Centre St @ Ward St": "8525", "Centre St @ Weld St": "5223", "Centre St @ Willow St.": "785", "Centre St @ Willow St": "806", "Centre St opp Bellevue st": "808", "Centre St Opp Mt Vernon St": "782", "Chapel St @ Great Plain Ave": "81437", "Chapel St @ Watertown St": "7804", "Chapel St @ Watertown St": "7856", "Charles Park Rd @ Rivermoor St": "137", "Charles Park Rd @ VFW Pkwy": "10821", "Charles River Loop": "820", "Charles St S @ Park Plaza": "1241", "Chestnut Hill Ave @ Academy Hill Rd": "1085", "Chestnut Hill Ave @ Ackers Ave": "11845", "Chestnut Hill Ave @ Beacon St": "1092", "Chestnut Hill Ave @ Buckminster Rd": "11917", "Chestnut Hill Ave @ Channing Rd": "81917", "Chestnut Hill Ave @ Chiswick Rd": "1031", "Chestnut Hill Ave @ Commonwealth Ave": "1028", "Chestnut Hill Ave @ Commonwealth Ave": "1029", "Chestnut Hill Ave @ Commonwealth Ave": "1090", "Chestnut Hill Ave @ Eliot St": "21835", "Chestnut Hill Ave @ Embassy Rd": "1088", "Chestnut Hill Ave @ Englewood Ave": "1027", "Chestnut Hill Ave @ Jackson Ave": "1086", "Chestnut Hill Ave @ Reservoir Busway": "21917", "Chestnut Hill Ave @ South St": "1089", "Chestnut Hill Ave @ Strathmore Rd": "1030", "Chestnut Hill Ave @ Union St": "1034", "Chestnut Hill Ave @ Veronica Smith Ctr": "1026", "Chestnut Hill Ave @ Wallingford Rd": "1033", "Chestnut Hill Ave @ Washington St": "1084", "Chestnut Hill Ave @ Wiltshire Rd": "1087", "Chestnut Hill Ave opp Ackers Ave": "91916", "Chestnut Hill Ave opp Buckminster Rd": "11835", "Chestnut Hill Ave opp Veronica Smith Ctr": "1108", "Chestnut Hill Ave opp Wiltshire Rd": "1032", "Chestnut St @ Elliot St": "8145", "Chestnut St @ Elliot St": "82132", "Chestnut St @ Great Plain Ave": "71852", "Chestnut St @ Oak St": "8146", "Chestnut St @ Oak St": "81852", "Chestnut St @ Pennsylvania Ave": "81451", "Chestnut St @ Pennsylvania Ave": "82131", "Chestnut St opp Oak St": "11853", "Church St @ Lexington St": "2134", "Clyde St @ Country Rd": "51918", "Clyde St @ Whitney St": "51917", "Clyde St opp Country Rd": "61835", "Clyde St opp Whitney St": "71835", "Columbus Ave @ Malcolm X Blvd": "1222", "Common St @ School St": "6598", "Commonwealth Ave @ Ash St": "7831", "Commonwealth Ave @ Auburn St": "78212", "Commonwealth Ave @ Auburn St": "7833", "Commonwealth Ave @ Babcock St": "933", "Commonwealth Ave @ Babcock St": "958", "Commonwealth Ave @ Blandford St": "941", "Commonwealth Ave @ Buick St": "956", "Commonwealth Ave @ Carlton St": "937", "Commonwealth Ave @ Cheswick Rd": "78213", "Commonwealth Ave @ Granby St": "952", "Commonwealth Ave @ Hinsdale St": "939", "Commonwealth Ave @ Islington St": "7827", "Commonwealth Ave @ Islington St": "7830", "Commonwealth Ave @ Marriott": "7828", "Commonwealth Ave @ Melrose St": "7825", "Commonwealth Ave @ Melrose St": "7832", "Commonwealth Ave @ Pamella Ct": "65547", "Commonwealth Ave @ Pleasant St": "934", "Commonwealth Ave @ Silber Way": "951", "Commonwealth Ave @ St Marys St": "938", "Commonwealth Ave @ St Marys St": "953", "Commonwealth Ave @ St Paul St": "935", "Commonwealth Ave @ University Rd": "1810", "Commonwealth Ave @ University Rd": "954", "Commonwealth Ave @ Windemere Rd": "65545", "Commonwealth Ave @ Windemere Rd": "78214", "Commonwealth Ave opp Ash St": "7826", "Commonwealth Ave opp Cheswick Rd": "65546", "Commonwealth Ave opp Pamella Ct": "78211", "Congress St @ Haymarket Sta": "117", "Congress St @ North St": "191", "Congress St @ State St": "190", "Congress St opp Hanover St": "30203", "Corey St @ LaGrange St": "11839", "Corey St @ Marlin Rd": "21839", "Corey St @ VFW Pkwy": "1888", "Corey St @ Weld St": "1841", "Corey St opp Mount Benedict Cemetery": "31839", "Corinth St @ Washington St": "795", "Crafts St @ Albemarle St": "7741", "Crafts St @ Albemarle St": "81685", "Crafts St @ California St": "7743", "Crafts St @ California St": "81683", "Crafts St @ Harding St": "81686", "Crafts St @ North St": "7742", "Crafts St @ North St": "81684", "Crafts St @ Waltham St": "7740", "Crescent St @ Maple St": "7845", "Crescent St @ Robbins St": "7844", "Crescent St @ Spruce St": "7813", "Crescent St @ Walnut St": "7846", "Crescent St @ Woerd Ave": "7816", "Crescent St @ Woerd Ave": "7843", "Crescent St opp Cherry St": "78141", "Crescent St opp Robbins St": "7815", "Cummins Hwy @ Washington St": "6428", "Cypress St @ Braeland Ave": "8503", "Cypress St @ Braeland Ave": "8529", "Cypress St @ Franklin St": "1551", "Cypress St @ Kendall St": "1550", "Cypress St @ Milton Rd": "1548", "Cypress St @ Rice St": "1531", "Cypress St @ Walnut St": "1532", "Cypress St @ Walnut": "1549", "Cypress St opp Henry St": "1530", "Dale St @ Bacon St": "7864", "Dale St @ Claremont St": "7722", "Dale St @ Lexington St": "7794", "Dale St @ Lexington St": "7862", "Dale St opp Caughey St": "7721", "Dalton St @ Boylston St": "11390", "Dartmouth St @ Appleton St": "1384", "Dartmouth St @ Appleton St": "1395", "Dartmouth St @ Back Bay Sta": "11384", "Dartmouth St @ Tremont St": "1383", "Dartmouth St @ Tremont St": "1396", "Dartmouth St opp Back Bay Sta": "176", "Dedham Mall @ Old Navy": "10832", "Dedham Mall @ Stop & Shop": "10833", "Dedham St @ Arnold St": "8490", "Dedham St @ Brookline St": "8487", "Dedham St @ Carlson Ave": "8544", "Dedham St @ Country Club Rd": "8493", "Dedham St @ Greenwood St": "8491", "Dedham St @ Meadowbrook Rd": "8492", "Dedham St @ Nahanton St": "8543", "Dedham St @ Rosalie St": "8489", "Dedham St @ Wiswall Rd": "8545", "Dedham St opp Arnold Rd": "8542", "Dedham St opp Country Club Rd": "8539", "Dedham St opp Greenwood St": "8541", "Dedham St opp Meadowbrook Rd": "8540", "Dedham St opp Nahanton St": "8488", "Dedham St opp Rosalie Rd": "18542", "Dedham St opp Wiswall Rd": "8486", "Devonshire St @ Milk St": "6548", "Dudley Station": "64", "Dudley Station": "64000", "E Newton St @ Washington St": "9421", "Eliot St @ Bennett St": "32549", "Elliot St @ Charles St": "8208", "Elliot St @ Columbia Ave": "8150", "Elliot St @ Columbia Ave": "8209", "Elliot St @ Cottage St": "8210", "Elliot St @ Linden St": "8148", "Elliot St @ Linden St": "8211", "Elliot St @ Wetherell St": "8149", "Elliot St opp Charles St": "8151", "Elm St @ River St": "7654", "Elm St @ Washington St": "7652", "Elm St @ Webster St": "7621", "Elm St @ Webster St": "7653", "Faneuil St @ Bigelow St": "1213", "Faneuil St @ Brackett St": "1093", "Faneuil St @ Brackett St": "1212", "Faneuil St @ Brooks St": "1211", "Faneuil St @ Donnybrook Rd": "12081", "Faneuil St @ Fairbanks St": "1094", "Faneuil St @ Oak Square": "1214", "Faneuil St @ Oakland St": "1095", "Faneuil St @ S Hobart St": "1097", "Faneuil St opp Bothwell Rd": "1096", "Faneuil St opp Garfield School": "1210", "Federal St @ Franklin St": "6551", "Forest Hills Station Upper Busway": "10642", "Forest St @ Beaver St": "78612", "Forest St @ Beaver St": "78620", "Forest St @ Doty St": "78608", "Forest St @ Doty St": "78624", "Forest St @ Gann Academy": "78623", "Forest St @ Harrington Rd": "78609", "Forest St @ Pigeon Ln": "78611", "Forest St opp Harrington Rd": "78622", "Forest St opp Woodcliff Dr": "78621", "Franklin St @ Devonshire St": "6535", "Franklin St @ Sidney St": "730", "Fredette Rd @ Sawmill Brook Pkwy": "8475", "Fredette Rd @ Sawmill Brook Pkwy": "8555", "Fredette Rd @ Spiers Rd": "84741", "Fredette Rd @ Spiers Rd": "85551", "Galen St @ Boyd St": "902", "Galen St @ Maple St": "989", "Garden St opp Mason St": "2170", "Green St @ Magazine St": "1123", "Green St @ Pearl St": "2755", "Grove St @ Allendale Rd": "31916", "Grove St @ Bellingham St": "21916", "Grove St @ Russet Rd": "1893", "Grove St @ South St": "11837", "Grove St @ South St": "1895", "Grove St opp Allandale Rd": "81835", "Guest St @ Life St": "11972", "Hammond St @ Columbus Ave": "77244", "Hammond St @ Lawrence St": "77243", "Hammond St @ Plympton St": "77242", "Harvard Ave @ Brighton Ave": "1379", "Harvard Ave @ Commonwealth Ave": "1302", "Harvard Ave @ Commonwealth Ave": "1378", "Harvard Lower Busway @ Red Line": "2076", "Harvard Sq @ Garden St - Dawes Island": "22549", "Harvard St @ Aspinwall Ave": "1369", "Harvard St @ Beacon St": "1308", "Harvard St @ Beacon St": "1372", "Harvard St @ Coolidge St": "1304", "Harvard St @ Coolidge St": "1375", "Harvard St @ Harris St": "1310", "Harvard St @ Kent St": "1367", "Harvard St @ Marion St": "1309", "Harvard St @ School St": "1311", "Harvard St @ Shailer St": "1306", "Harvard St @ Stedman St": "1373", "Harvard St @ Verndale St": "11302", "Harvard St @ Washington St": "1313", "Harvard St opp Verndale St": "1376", "Harvard St opp Vernon St": "1371", "Harvard Upper Busway @ Red Line": "20761", "High St @ Beech St": "77375", "High St @ Cedar St": "77521", "High St @ Cumberland Ave": "1554", "High St @ Cypress St": "15291", "High St @ Cypress St": "1552", "High St @ Gardner St": "77541", "High St @ Hall St": "7755", "High St @ Hamblin Rd": "77379", "High St @ Hamblin Rd": "7752", "High St @ Highland Rd": "1553", "High St @ Hovey Rd": "77378", "High St @ Moody St": "77551", "High St @ Newton St": "77376", "High St @ Newton St": "7754", "High St @ Oakland Rd": "1529", "High St @ Pamenter Rd": "7753", "High St @ Parmenter Rd": "77377", "High St opp Edgehill Rd": "1528", "Highland Ave @ Avery Sq": "82140", "Highland Ave @ Dana Pl": "31852", "Highland Ave @ Dana Pl": "81440", "Highland Ave @ Mark Lee Rd": "81441", "Highland Ave @ May St": "61852", "Highland Ave @ May St": "82437", "Highland Ave @ Oakland Ave": "81438", "Highland Ave @ Rosemary St": "41852", "Highland Ave @ Rosemary St": "81439", "Highland Ave opp Oakland Ave": "51852", "Hillside Ave @ Avery St": "81443", "Hillside Ave @ Avery St": "82138", "Hillside Ave @ Hunnewell St": "81442", "Hillside Ave @ Hunnewell St": "82139", "Hobart St @ Brooks St": "1100", "Hobart St @ Brooks St": "1206", "Hobart St @ Falkland St": "1098", "Hobart St @ Falkland St": "1208", "Hope Ave @ Boston Children's Waltham": "7670", "Hope Ave @ Boston Children's Waltham": "88341", "Huntington Ave @ Fenwood Rd": "1363", "Huntington Ave @ Mass Ave": "34513", "Huntington Ave @ Mass Ave": "34514", "Huntington Ave @ Parker Hill Ave": "1315", "Huntington Ave @ Riverway": "1366", "Huntington Ave @ S Huntington Ave": "1314", "Huntington Ave opp Fenwood Rd": "1317", "Independece Dr opp shopping mall": "1836", "Independence Dr @ Beverly Rd": "31836", "Independence Dr @ Gerry Rd": "41836", "Independence Dr @ Sherman Rd": "51836", "Independence Dr @ Thornton Rd": "1891", "Independence Dr opp Gerry Rd": "1892", "Ipswich St @ Charlesgate East": "1920", "Ipswich St @ Charlesgate East": "1930", "JFK St @ Eliot St": "2550", "JFK St @ Eliot St": "25641", "Kenmore Station Busway": "899", "Kirkland St @ Kirkland Place": "2548", "Kirkland St @ Sumner Rd": "2568", "Kirkland St @ Trowbridge St": "2569", "Kirkland St opp Trowbridge St": "2547", "Kneeland St @ Washington St": "6542", "LaGrange @ Brookfarm Rd": "41839", "LaGrange St @ Anderer Ln": "51839", "Lagrange St @ Burard St": "839", "LaGrange St @ Centre St": "844", "Lagrange St @ Dent St": "843", "Lagrange St @ Pender St": "840", "Lagrange St @ Vermont St": "838", "Lagrange St @ Vermont St": "850", "Lagrange St @ Virgil Rd": "841", "Lagrange St @ Westmount Ave": "842", "Lagrange St @ Westmount Ave": "846", "Lagrange St opp Burard St": "849", "Lagrange St opp Dent St": "845", "Lagrange St opp Pender St": "848", "Lagrange St opp Virgil St": "847", "Lake St @ Bowdoin Ave": "7789", "Lake St @ Hibiscus Ave": "7786", "Lake St @ Hibiscus Ave": "8918", "Lake St @ Indian Rd": "7790", "Lake St @ Indian Rd": "8915", "Lake St @ Lexington St": "7792", "Lake St @ Lexington St": "8913", "Lake St @ Lincoln St": "7785", "Lake St @ Lincoln St": "8919", "Lake St @ Nutting Rd": "7791", "Lake St @ Princeton Ave": "8916", "Lake St @ Seminole Ave": "7787", "Lake St @ Seminole Ave": "8932", "Lake St opp Nutting Rd": "8914", "Lake St opp Shore Rd": "7788", "Lasell St @ Lagrange St": "837", "Lasell St @ Perham St": "835", "Lasell St @ Temple St": "834", "Lee St @ Boylston St": "11545", "Lee St @ Boylston St": "81916", "Lee St @ Sears Rd": "51835", "Lee St @ Sears Rd": "61916", "Lee St @ Warren St": "41835", "Lee St opp Dudley Way": "31835", "Lee St opp Warren St": "71916", "Lexington St @ Auburndale Ave": "7834", "Lexington St @ Beech St": "77152", "Lexington St @ Belmont St": "7711", "Lexington St @ Brookway Rd": "7774", "Lexington St @ Burnham St": "7710", "Lexington St @ College Farm Rd": "1600", "Lexington St @ Curve St": "1604", "Lexington St @ Freeman St": "78205", "Lexington St @ Lexington Terr": "7860", "Lexington St @ Lincoln St": "1605", "Lexington St @ Orris St": "78204", "Lexington St @ Orris St": "7835", "Lexington St @ Pond St": "7796", "Lexington St @ River St": "7838", "Lexington St @ Roberta Rd": "7837", "Lexington St @ Rumford St": "78201", "Lexington St @ School St": "7797", "Lexington St @ Stanley Rd": "8909", "Lexington St @ Sycamore St": "77053", "Lexington St @ Sycamore St": "7709", "Lexington St @ Whitlowe Rd": "7659", "Lexington St @ Whitlowe Rd": "86968", "Lexington St opp Brookway Rd": "8931", "Lexington St opp College Farm Rd": "8912", "Lexington St opp Curve St": "8908", "Lexington St opp Lincoln St": "8907", "Lexington St opp Shopping Plaza": "7861", "Lexington St opp Stanley Rd": "1602", "Life St @ Guest St": "11070", "Lincoln St @ Beach St": "6550", "Lincoln St @ Bowdoin St": "8154", "Lincoln St @ Bowdoin St": "8205", "Lincoln St @ Graymore Rd": "8920", "Lincoln St @ Silver Hill Ln": "8921", "Lincoln St @ Smith St": "7782", "Lincoln St @ Smith St": "8922", "Lincoln St @ Woodward St": "8153", "Lincoln St @ Woodward St": "8206", "Lincoln St opp Graymore Rd": "7784", "Lincoln St opp Silver Hill Ln": "7783", "Longwood Ave @ Brookline Ave": "1779", "Louis Prang St @ Evans Way": "1800", "Magazine St @ Allston St": "1763", "Magazine St @ Auburn St": "1122", "Magazine St @ Erie St": "1119", "Magazine St @ Green St": "1060", "Magazine St @ Kelly Rd": "1762", "Magazine St @ McTernan Way": "1120", "Magazine St @ Perry St": "1121", "Magazine St @ Putnam Ave": "1118", "Magazine St @ William St": "1125", "Main Shopping Center @ Market Basket": "9526", "Main Shopping Center @ Marshall's": "9525", "Main St @ Appleton St": "86945", "Main St @ Beal Rd": "8826", "Main St @ Bowker Rd": "9521", "Main St @ Chamberlain Terr": "8671", "Main St @ Chamberlain Terr": "8831", "Main St @ Chestnut St": "8296", "Main St @ Copeland St": "8821", "Main St @ Craven Cir": "8833", "Main St @ Cross St": "8297", "Main St @ Daniels Ct": "86941", "Main St @ Edenfield Ave": "8819", "Main St @ Edgehill Rd": "8845", "Main St @ Emerson Rd": "8823", "Main St @ Evans St": "8291", "Main St @ Everett St": "86935", "Main St @ Exchange St": "88335", "Main St @ Fiske St": "88336", "Main St @ French St": "8295", "Main St @ Grant St": "18335", "Main St @ Hammond St": "88337", "Main St @ Harvard St": "86940", "Main St @ Heard St": "86946", "Main St @ Hill Rd": "8846", "Main St @ Howard St": "8298", "Main St @ Kendall Station - Red Line": "2231", "Main St @ LaFayette St": "8675", "Main St @ Liberty St": "88332", "Main St @ Longfellow Rd": "8824", "Main St @ Lunda St": "8843", "Main St @ Malone St": "8844", "Main St @ Merchants Row": "8815", "Main St @ Oakland St": "8294", "Main St @ Olcott St": "8339", "Main St @ Olney St": "8820", "Main St @ Palmer St": "8841", "Main St @ Pleasant St": "8832", "Main St @ Prospect Hill Rd": "8842", "Main St @ Prospect St": "86939", "Main St @ Rangeley Rd": "8676", "Main St @ Rose Hill Way": "8830", "Main St @ Sheridan Rd": "86932", "Main St @ Stow St": "86930", "Main St @ Stow St": "8848", "Main St @ Thaxter St": "8816", "Main St @ Townsend St": "8670", "Main St @ Warren St - Waltham Line": "8825", "Main St @ Waverley Ave": "8818", "Main St @ Wellington St": "86938", "Main St @ Weston St": "86937", "Main St @ Willow St": "8674", "Main St @ Wilmot St": "8822", "Main St opp Chestnut St": "8817", "Main St opp Green St": "88171", "Main St opp Longfellow Rd": "8679", "Main St opp Olcott St": "8293", "Main St opp Prospect Hill Rd": "86936", "Main St opp Rose Hill Way": "8672", "Main St opp Warren St - Watertown Line": "8678", "Main St opp Willow St": "8828", "Malcolm X Blvd @ King St": "11257", "Malcolm X Blvd @ Madison Park HS": "11148", "Malcolm X Blvd @ O'Bryant HS": "11149", "Malcolm X Blvd @ Shawmut Ave": "11259", "Malcolm X Blvd @ Shawmut Ave": "1148", "Malcolm X Blvd @ Tremont St": "21148", "Malcolm X Blvd opp Madison Park HS": "1259", "Malcolm X Blvd opp O'Bryant HS": "11323", "Mall at Chestnut Hill @ Bloomingdales": "19661", "Market St @ Arlington St": "1083", "Market St @ Centola St": "1041", "Market St @ Gardena St": "1038", "Market St @ Guest St": "1040", "Market St @ Lothrop St": "1042", "Market St @ N Beacon St": "1039", "Market St @ Sparhawk St": "1036", "Market St @ Vineland St": "1079", "Market St @ Washington St": "1035", "Market St opp Gardena St": "1081", "Market St. opp. Mapleton St.": "1082", "Massachusetts Ave @ Beacon St": "95", "Massachusetts Ave @ Clearway St": "91", "Massachusetts Ave @ Columbus Ave": "83", "Massachusetts Ave @ Columbus Ave": "88", "Massachusetts Ave @ Huntington Ave": "82", "Massachusetts Ave @ Johnston Gate": "2168", "Massachusetts Ave @ Marlborough St": "77", "Massachusetts Ave @ Massachusetts Ave Station": "187", "Massachusetts Ave @ Massachusetts Ave Station": "188", "Massachusetts Ave @ Newbury St": "79", "Massachusetts Ave @ Newbury St": "93", "Massachusetts Ave @ Pearl St": "72", "Massachusetts Ave @ Prospect St": "102", "Massachusetts Ave @ Sidney St": "101", "Massachusetts Ave @ Sidney St": "73", "Massachusetts Ave @ St Botolph St": "89", "Massachusetts Ave @ Tremont St": "84", "Massachusetts Ave @ Tremont St": "87", "Massachusetts Ave @ Washington St": "10590", "Massachusetts Ave @ Washington St": "59", "Massachusetts Ave @ Waterhouse St": "2307", "Massachusetts Ave opp Christian Science Ctr": "80", "Massachusetts Ave opp Waterhouse St": "2310", "Medford St @ Washington St": "2690", "Melnea Cass Blvd @ Washington St": "7", "Melnea Cass Blvd @ Washington St": "77777", "Milk St @ Devonshire St": "16539", "Millennium Park": "67120", "Moody St @ Adams Ave": "76591", "Moody St @ Ash St": "76594", "Moody St @ Ash St": "86964", "Moody St @ Carter St": "86971", "Moody St @ Crescent St": "86961", "Moody St @ Cushing St": "76596", "Moody St @ Derby St": "76592", "Moody St @ High St": "76595", "Moody St @ Main St.": "86970", "Moody St @ Main St": "86943", "Moody St @ Maple St": "86963", "Moody St @ Orange St": "86965", "Moody St @ Pine St": "76597", "Moody St @ Robbins St": "7660", "Moody St @ Walnut St": "86962", "Moody St @ Washington Ave": "76593", "Moody St opp Underwood Pk": "86967", "Mountfort St @ Carlton St": "11809", "Mt Auburn St @ Aberdeen Ave": "2029", "Mt Auburn St @ Aberdeen Ave": "2065", "Mt Auburn St @ Adams Ave": "2038", "Mt Auburn St @ Adams St": "2058", "Mt Auburn St @ Amherst Rd": "2040", "Mt Auburn St @ Ash St": "2021", "Mt Auburn St @ Bates Rd E": "2047", "Mt Auburn St @ Bigelow Ave": "2060", "Mt Auburn St @ Boylston St": "2054", "Mt Auburn St @ Brattle St": "2028", "Mt Auburn St @ Brewer St": "2073", "Mt Auburn St @ Coolidge Ave": "2067", "Mt Auburn St @ Franklin St": "2051", "Mt Auburn St @ Homer Ave": "2030", "Mt Auburn St @ Keenan St": "2033", "Mt Auburn St @ Kimball Rd": "2034", "Mt Auburn St @ Longfellow Rd": "2025", "Mt Auburn St @ Main St": "2046", "Mt Auburn St @ Main St": "2048", "Mt Auburn St @ Marshall St": "2043", "Mt Auburn St @ Mt Auburn Hospital": "2070", "Mt Auburn St @ Parker St": "2050", "Mt Auburn St @ Patten St": "2049", "Mt Auburn St @ Ralph Piteri Terr": "2062", "Mt Auburn St @ Russell Ave": "2042", "Mt Auburn St @ Saint Marys St": "2032", "Mt Auburn St @ School St": "2057", "Mt Auburn St @ Sparks St": "2023", "Mt Auburn St @ Story St": "2020", "Mt Auburn St @ Summer St": "2044", "Mt Auburn St @ Traill St": "2026", "Mt Auburn St @ University Rd": "2074", "Mt Auburn St @ Upland Rd": "2036", "Mt Auburn St @ Walnut St": "2052", "Mt Auburn St @ Winsor Ave": "2037", "Mt Auburn St @ Winthrop St": "2056", "Mt Auburn St opp Brattle St": "2066", "Mt Auburn St opp Coolidge Ave": "2027", "Mt Auburn St opp Homer Ave": "2064", "Mt Auburn St opp Keenan St": "2061", "Mt Auburn St opp Sparks St": "2071", "Mt Auburn St opp Traill St": "2068", "N Beacon St @ Birmingham Pkwy": "1203", "N Beacon St @ Cambridge St": "1110", "N Beacon St @ Cambridge St": "1196", "N Beacon St @ Etna St": "1107", "N Beacon St @ Goodenough St": "1103", "N Beacon St @ Life St": "1199", "N Beacon St @ Market St": "1200", "N Beacon St @ Parsons St": "1102", "N Beacon St @ Saunders St": "1109", "N Beacon St @ Vineland St": "1202", "N Beacon St opp Saunders St": "1197", "N Beacon St opp Vineland St": "1104", "N Harvard St @ Coolidge Rd": "2555", "N Harvard St @ Empire St": "2558", "N Harvard St @ Franklin St": "2554", "N Harvard St @ Gate 2 Harvard Stadium": "2551", "N Harvard St @ Hooker St": "2556", "N Harvard St @ Kingsley St": "2560", "N Harvard St @ Oxford St": "2559", "N Harvard St @ Western Ave": "2553", "N Harvard St @ Western Ave": "2561", "N Harvard St opp Harvard Stadium Gate 2": "2564", "Needham Junction @ Commuter Rail Station": "91852", "Needham St @ Charlemont St": "82047", "Needham St @ Columbia Ave": "82049", "Needham St @ Easy St": "82030", "Needham St @ Jaconett Rd": "82031", "Needham St @ Jaconnet St": "82048", "Needham St @ Oak St": "83032", "Needham St opp Charlemont St": "82032", "Needham St opp Columbia Ave": "82039", "Needham St opp Easy St": "82050", "New Sudbury @ Congress St": "4511", "Newton St @ Arlington Rd": "1001", "Newton St @ Grove St": "41916", "Newton St @ Grove St": "91835", "Oak St @ Chestnut St": "81463", "Oak St @ Chestnut St": "8213", "Oak St @ Elliot St": "8147", "Oak St @ Elliot St": "8212", "Opp 174 Walter St": "1872", "Opp 175 Wyman St": "18925", "Opp 2000 Centre St": "810", "Opp 210 Nahanton St": "84880", "Opp 271 Waverley Oaks Rd": "78631", "Opp 380 Trapelo Rd": "78607", "Opp 40 Second Ave": "17002", "Opp 404 Wyman St": "89613", "Opp 43 W Dedham St": "1397", "Opp 45 Dale St": "7793", "Opp 48 Woerd Ave": "7817", "Opp 617 Lexington St - Waltham HS": "1601", "Opp 650 VFW Pkwy": "1838", "Opp 677 Winchester St": "85288", "Opp 680 Lexington St": "8911", "Opp 700 Pleasant St": "78073", "Opp 763 Boylston St": "1544", "Opp 850 Boylston St": "1537", "Opp 910 Boylston St": "1538", "Opp 976 Lexington St": "86915", "opp. 135 Beaver St.": "78632", "Otis St @ Summer St": "16535", "Park Dr @ Beacon St": "1775", "Park Dr @ Beacon St": "1808", "Park Dr @ Fenway Sta": "11520", "Park Dr @ Fenway Sta": "9434", "Park Dr @ Fenway Station": "1807", "Park Dr @ Mountfort St": "1809", "Park St @ Elmwood St": "904", "Park St @ Tremont St": "987", "Parker St @ Athelstane Rd": "8531", "Parker St @ Boylston St": "8499", "Parker St @ Boylston St": "8533", "Parker St @ Cypress St": "8502", "Parker St @ Cypress St": "8530", "Parker St @ Dedham St": "8494", "Parker St @ Dedham St": "8538", "Parker St @ Glenwood Ave": "8501", "Parker St @ Hagen Rd": "8497", "Parker St @ Hagen Rd": "8535", "Parker St @ Parker Ave": "8534", "Parker St @ Parker Rd": "8536", "Parker St @ Roosevelt Rd": "8496", "Parker St @ Stearns St": "8532", "Parker St @ Wheeler Rd": "8495", "Parker St opp Wheeler Rd": "8537", "Pearl St @ Congress St": "11891", "Pearl St @ Washington St": "11366", "Pleasant St @ Bridge St": "7807", "Pleasant St @ Bridge St": "78531", "Pleasant St @ Paramount Pl": "78513", "Poplar St @ Washington St": "6022", "Prospect St @ Bishop Allen Dr": "2443", "Prospect St @ Bishop Allen Dr": "2446", "Prospect St @ Broadway": "2441", "Prospect St @ Broadway": "2448", "Prospect St @ Harvard St": "2442", "Prospect St @ Harvard St": "2447", "Putnam Ave @ Allston St": "1117", "Quincy St @ Kirkland St": "2567", "Ring Rd @ Huntington Ave": "179", "River St @ Bright St": "7810", "River St @ Bright St": "7850", "River St @ Fairmont St": "1056", "River St @ Jackson St": "78121", "River St @ Jackson St": "78471", "River St @ James St": "7617", "River St @ James St": "7657", "River St @ Lexington St": "7616", "River St @ Lexington St": "7658", "River St @ Mague Ave": "7655", "River St @ Newton St": "7812", "River St @ Newton St": "7848", "River St @ Pine St": "7618", "River St @ Pleasant St": "1058", "River St @ Ripley St": "7811", "River St @ Ripley St": "7849", "River St @ School Ave": "7809", "River St @ School Ave": "7851", "River St @ Seyon St": "7808", "River St @ Seyon St": "7852", "River St @ Sheridan St": "7656", "River St @ William St": "76561", "River St @ Willow St": "78511", "River St opp Blackstone St": "1055", "River St opp Mague St": "7619", "River St opp Williams St": "76171", "Rivermoor St @ Charles Park Rd": "129", "Rivermoor St @ Industrial Park": "120", "Riverside Station": "38155", "Robert St @ Belgrade Ave": "11860", "Robert St @ Belgrade Ave": "1867", "Rumford Ave @ Buttrick St": "7820", "Rumford Ave @ Buttrick St": "7839", "Rumford Ave @ Woerd Ave": "7818", "Rumford Ave @ Woerd Ave": "7841", "S Huntington Ave @ Huntington Ave": "21365", "S Huntington Ave @ Huntington Ave": "6575", "Saint James Ave @ Arlington St": "177", "Saint James Ave @ Clarendon St": "173", "Saint James Ave @ Dartmouth St": "178", "Sawmill Brook Pkwy @ Keller Path": "8477", "Sawmill Brook Pkwy @ Keller Path": "8553", "Sawmill Brook Pkwy @ McCarthy Rd": "8476", "Sawmill Brook Pkwy @ McCarthy Rd": "8554", "Sawmill Brook Pkwy @ Spiers Rd": "8478", "Sawmill Brook Pkwy @ Spiers Rd": "85511", "Sawmill Brook Pkwy @ Van Roosen Rd": "8479", "Sawmill Brook Pkwy @ Van Roosen Rd": "8551", "Sawmill Brook Pkwy @ Walsh Rd": "84791", "Sawmill Brook Pkwy @ Walsh Rd": "8552", "School St @ Lexington St": "7859", "Smith St @ Loretta Rd": "8923", "Smith St @ Trapelo Rd": "7780", "Smith St @ Trapelo Rd": "8924", "Smith St opp Loretta Rd": "7781", "Somerville Ave @ Prospect St": "2597", "Somerville Ave @ Stone Ave": "2612", "South St @ Angelside St": "7600", "South St @ Bedford St": "88340", "South St @ Brandeis University": "88344", "South St @ Dartmouth St": "7605", "South St @ Russell St": "76052", "South St @ Shakespeare Rd": "88342", "South St @ Taft Hill Terr": "602", "South St @ Turner St": "88345", "South St @ Weston St": "88339", "South St opp Brandeis Univ Entrance": "7602", "South St opp Old South St": "17670", "South St opp Shakespeare Rd": "76031", "Spiers Rd @ Dedham St": "8556", "Spiers Rd @ June Ln": "8474", "Spring St @ Baker St": "777", "Spring St @ Baker St": "815", "Spring St @ Cass St": "10777", "Spring St @ Centre St": "779", "Spring St @ Charles River Loop": "774", "Spring St @ Cypress St": "776", "Spring St @ Gardner St": "814", "Spring St @ Gould St": "775", "Spring St @ Moville St": "816", "Spring St @ Summer St": "778", "Spring St @ Temple St": "812", "Spring St @ VA Hospital": "817", "Spring St opp Summer St": "813", "Spring Street opp Charles River Loop": "818", "Spruce St @ Crescent St": "78461", "Spruce St @ Moody St": "78122", "Spruce St @ Moody St": "7847", "St Joseph Cemetery": "61839", "Stow St @ Tavern Rd": "86929", "Stow St @ Tavern Rd": "8849", "Stuart St @ Charles St S": "9983", "Stuart St @ Dartmouth St": "71855", "Stuart St @ Tremont St": "91856", "Sullivan Station - Lower Busway": "28741", "Sullivan Station - Upper Busway": "2874", "Sunnyside St @ South St": "88346", "Surface Artery @ Kneeland St": "6555", "Tappan St @ Greenough St": "34589", "Tavern Rd @ Weston St": "8850", "Tomlin St @ Dale St": "7723", "Tomlin St @ Summit St": "7724", "Totten Pond Rd @ Craig Ln": "18929", "Totten Pond Rd @ Craig Ln": "89608", "Totten Pond Rd @ Glen St": "89609", "Totten Pond Rd @ Pond End Rd": "89606", "Totten Pond Rd @ Rando Ln": "18930", "Totten Pond Rd @ Rondo Ln": "89607", "Totten Pond Rd @ Third Ave": "18928", "Totten Pond Rd @ Third Ave": "89610", "Trapelo Rd @ Bartlett Ave": "2104", "Trapelo Rd @ Beech St": "2102", "Trapelo Rd @ Beech St": "2131", "Trapelo Rd @ Belmont St - Benton Square": "2108", "Trapelo Rd @ Berkley St": "7779", "Trapelo Rd @ Briarwood Rd": "78604", "Trapelo Rd @ Chase Rd": "78605", "Trapelo Rd @ Cherry Ln": "78627", "Trapelo Rd @ Church St": "2099", "Trapelo Rd @ Grove Rd": "8928", "Trapelo Rd @ Hardy Pond Rd": "8929", "Trapelo Rd @ Leitha Rd": "7775", "Trapelo Rd @ Outlook Rd": "8926", "Trapelo Rd @ Porter Rd": "78606", "Trapelo Rd @ Sheffield Rd": "7776", "Trapelo Rd @ Slade St": "2129", "Trapelo Rd @ Sycamore St": "2101", "Trapelo Rd @ Walnut St": "2103", "Trapelo Rd @ Waverley St": "2133", "Trapelo Rd @ Williston Rd - Cushing Square": "2106", "Trapelo Rd @ Willow St": "2126", "Trapelo Rd opp Berkley St": "8925", "Trapelo Rd opp Briarwood Rd": "78628", "Trapelo Rd opp Outlook Rd": "7778", "Trapelo Rd opp Poplar St": "2128", "Trapelo Rd opp Porter Rd": "78626", "Trapelo Rd opp Walnut St": "2130", "Trapelo Rd opp Williston Rd - Cushing Square": "2127", "Tremont St @ Beacon St": "49704", "Tremont St @ Boylston Station": "8279", "Tremont St @ Columbus Ave": "1323", "Tremont St @ Cufflin St": "909", "Tremont St @ Dartmouth St": "1247", "Tremont St @ Hibbard Rd": "986", "Tremont St @ Huntington Ave": "1362", "Tremont St @ Pembroke St": "907", "Tremont St @ Playstead Rd": "983", "Tremont St @ Saint Alphonsus St": "1320", "Tremont St @ Saint Alphonsus St": "1360", "Tremont St @ Sewall St": "1322", "Tremont St @ Tobin Community Center": "13590", "Tremont St @ Tremont Pl": "910", "Tremont St @ W Dedham St": "1235", "Tremont St @ Washington St": "912", "Tremont St @ Washington St": "979", "Tremont St @ Waverley Ave": "906", "Tremont St @ Waverley Ave": "985", "Tremont St opp Cufflin St": "982", "Tremont St opp Hibbard Rd": "905", "Tremont St opp Roxbury Crossing Sta": "1357", "Tremont St opp Temple Pl": "10000", "Tremont St opp Tremont Pl": "981", "Tremont St opp Wigglesworth St": "1319", "Vermont St @ Baker St": "853", "Vermont St @ Carroll St": "851", "Vermont St @ Temple St": "852", "Veterans Hospital West Roxbury": "10820", "VFW Pkwy @ Corey St": "1839", "W Dedham St @ Washington St": "1381", "W Dedham St @ Washington St": "1398", "W Roxbury Pkwy @ Belgrade Ave": "5257", "Wahington St @ Evans Rd": "1275", "Walnut St @ Austin St": "82853", "Walnut St @ Beacon St": "8157", "Walnut St @ Beacon St": "8200", "Walnut St @ Berwick Rd": "81561", "Walnut St @ Brentwood Ave": "8158", "Walnut St @ Brentwood Ave": "8199", "Walnut St @ Clyde St": "8164", "Walnut St @ Clyde St": "8193", "Walnut St @ Commonwealth Ave": "8161", "Walnut St @ Commonwealth Ave": "8196", "Walnut St @ Duncklee St": "8156", "Walnut St @ Duncklee St": "8202", "Walnut St @ Fisher Ave": "82011", "Walnut St @ High St": "1527", "Walnut St @ Homer St": "8160", "Walnut St @ Homer St": "8197", "Walnut St @ Lincoln St - Newton Highland Station": "8203", "Walnut St @ Lincoln St": "8155", "Walnut St @ Linwood Ave": "7744", "Walnut St @ Linwood Ave": "81682", "Walnut St @ Mill St": "8163", "Walnut St @ Mill St": "8194", "Walnut St @ Newtonville Ave": "8166", "Walnut St @ Otis St": "8192", "Walnut St @ Page Rd": "8168", "Walnut St @ Page Rd": "82851", "Walnut St @ Prospect Ave": "8162", "Walnut St @ Prospect Ave": "8195", "Walnut St @ Washington Pk": "81651", "Walnut St @ Washington St": "8167", "Walnut St @ Watertown St": "81681", "Walnut St @ Watertown St": "8189", "Walnut St opp Otis St": "8165", "Walter St @ Ashfield St": "18691", "Walter St @ Cotton St": "1870", "Walter St @ Hewlett St": "1860", "Walter St @ Mendum St": "1871", "Walter St @ Sheffield St": "1859", "Walter St opp Ashfield St": "18581", "Waltham St @ Bonita St": "7738", "Waltham St @ Hazelhurst Ave": "81688", "Waltham St @ Lodge Rd": "81687", "Walthm St @ Lodge Rd": "7739", "Warren St @ Brookline St": "7705", "Warren St @ Brookline St": "7712", "Warren St @ Waverley St": "7713", "Warren St @ Webster Rd": "75791", "Washington St @ Adams St": "7642", "Washington St @ Aldwin Rd": "641", "Washington St @ Archdale Rd": "598", "Washington St @ Archdale Rd": "640", "Washington St @ Armory St": "7649", "Washington St @ Auburn St": "65542", "Washington St @ Auburn St": "78218", "Washington St @ Bacon St": "903", "Washington St @ Bartlett St": "1293", "Washington St @ Beacon St": "1276", "Washington St @ Beacon St": "1292", "Washington St @ Beacon St": "2546", "Washington St @ Beacon St": "2570", "Washington St @ Boston St": "2763", "Washington St @ Breck Ave": "913", "Washington St @ Brock St": "975", "Washington St @ Calvin St": "2571", "Washington St @ Cherry St": "7651", "Washington St @ Chestnut Hill Ave": "918", "Washington St @ Chestnut St": "7625", "Washington St @ Church St": "7635", "Washington St @ Commonwealth Ave": "1273", "Washington St @ Commonwealth Ave": "1295", "Washington St @ Commonwealth Ave": "65544", "Washington St @ Commonwealth Ave": "78215", "Washington St @ Corey Rd": "1274", "Washington St @ Corey Rd": "1294", "Washington St @ Craft St": "7643", "Washington St @ Crafts St": "76431", "Washington St @ Cross St": "7648", "Washington St @ Cummins Hwy": "636", "Washington St @ Cypress St": "1282", "Washington St @ Dane St": "2545", "Washington St @ E Newton St": "1788", "Washington St @ Eddy St": "7647", "Washington St @ Essex St": "6537", "Washington St @ Essex St": "6567", "Washington St @ Euston St": "1272", "Washington St @ Fairbank St": "1291", "Washington St @ Firth Rd": "637", "Washington St @ Foster St": "917", "Washington St @ Foster St": "974", "Washington St @ Franklin St": "2760", "Washington St @ Gardner Path": "1280", "Washington St @ Gardner Rd": "1279", "Washington St @ Granfield Ave": "638", "Washington St @ Greenough Circle": "1281", "Washington St @ Greenough St": "65543", "Washington St @ Griggs Rd": "1289", "Washington St @ Harvard St": "1283", "Washington St @ Harvard St": "1286", "Washington St @ Harvard St": "7632", "Washington St @ Harvard St": "7644", "Washington St @ Highland St": "7624", "Washington St @ Hovey St": "7640", "Washington St @ Inner Belt Rd": "2777", "Washington St @ Jewett St": "7634", "Washington St @ Jewett St": "7641", "Washington St @ Joy St": "2775", "Washington St @ Kingman Rd": "25713", "Washington St @ Lake St": "916", "Washington St @ Leland St": "2616", "Washington St @ Lenox St": "4", "Washington St @ Lenox St": "60", "Washington St @ Lewis Terr": "7633", "Washington St @ Lochdale Rd": "597", "Washington St @ Lowell Ave": "7630", "Washington St @ Lowell St": "17645", "Washington St @ Market St": "973", "Washington St @ Massachusetts Ave": "5", "Washington St @ Massachusetts Ave": "55", "Washington St @ McGrath Hwy": "2762", "Washington St @ McGrath Hwy": "2774", "Washington St @ Melnea Cass Blvd - Silver Line": "3", "Washington St @ Melnea Cass Blvd": "2", "Washington St @ Melnea Cass Blvd": "61", "Washington St @ Merriam St": "2773", "Washington St @ Monastery Rd": "1270", "Washington St @ Monastery Rd": "1298", "Washington St @ Montfern Ave": "977", "Washington St @ Mosgrove Ave": "599", "Washington St @ Mt Vernon St": "2759", "Washington St @ Myrtle St - Cobble Hill Apt": "12759", "Washington St @ Mystic St": "1789", "Washington St @ New Washington St": "2776", "Washington St @ Oak Sq": "9780", "Washington St @ Parker St": "25712", "Washington St @ Pearl St": "1526", "Washington St @ Perry St": "25711", "Washington St @ Poplar St.": "635", "Washington St @ Prospect St": "65541", "Washington St @ Prospect St": "78219", "Washington St @ Ruggles St": "63", "Washington St @ School St": "1287", "Washington St @ Shaw St": "7623", "Washington St @ Shepard St": "1268", "Washington St @ Snow St": "1269", "Washington St @ South St": "601", "Washington St @ Station St": "1285", "Washington St @ Tollgate Way": "642", "Washington St @ Tufts St": "2761", "Washington St @ Union Pk": "5100", "Washington St @ W Newton St": "19402", "Washington St @ Waldo Terr": "972", "Washington St @ Walker St": "7646", "Washington St @ Walnut St": "7631", "Washington St @ Walnut St": "7645", "Washington St @ Walnut": "1555", "Washington St @ Washington Terr": "2610", "Washington St @ Watertown St": "7650", "Washington St @ Webster Ave": "2613", "Washington St @ Whipple Ave": "639", "Washington St @ Williams St": "62", "Washington St @ Winthrop Path": "1278", "Washington St @ Worcester St": "15176", "Washington St @ Worcester St": "1787", "Washington St opp Armory St": "76251", "Washington St opp Cross St": "7626", "Washington St opp Eddy St": "7627", "Washington St opp Euston Rd": "1296", "Washington St opp Gardner Rd": "1290", "Washington St opp Granfield Ave": "600", "Washington St opp Greenough St": "1288", "Washington St opp Montfern Ave": "914", "Washington St opp Myrtle St": "2778", "Washington St opp Parker St": "2615", "Washington St opp Ruggles St": "1", "Washington St opp Shepard St": "1300", "Washington St opp Snow St": "1299", "Washington St opp Waldo Terr": "919", "Washington St opp Walker St": "7629", "Waterhouse St @ Massachusetts Ave": "12614", "Watertown Sq Terminal": "8178", "Watertown St @ Adams St": "8170", "Watertown St @ Adams St": "8187", "Watertown St @ Chapel St": "8171", "Watertown St @ Chapel St": "8186", "Watertown St @ Craft St": "8285", "Watertown St @ Crafts St": "8169", "Watertown St @ Fifth Ave": "8176", "Watertown St @ Fifth St": "8181", "Watertown St @ Galen St": "8179", "Watertown St @ Galen St": "8284", "Watertown St @ Morse St": "8175", "Watertown St @ Pearl St": "8172", "Watertown St @ Pond St": "8174", "Watertown St @ Washburn St": "8173", "Watertown St opp Aldrich Rd": "8180", "Watertown St opp California St": "8177", "Watertown St opp Morse St": "8182", "Watertown St opp Pearl St": "8185", "Watertown St opp Pond St": "8183", "Watertown Yard": "900", "Waverley Oaks Rd @ Brookfield Rd": "78629", "Waverley Oaks Rd @ Parkview Rd": "78630", "Waverley Oaks Rd opp Brookfield Rd": "78603", "Waverley Oaks Rd opp Parkview Rd": "78602", "Webster St @ Central Ave": "81445", "Webster St @ Central Ave": "82136", "Webster St @ Elder St": "8144", "Webster St @ Hillside Ave": "81444", "Webster St @ Hillside Ave": "82137", "Webster St opp Elder Rd": "18144", "Weld St @ Alward Rd": "1876", "Weld St @ Avalon Rd": "1886", "Weld St @ Burnside Ave": "1849", "Weld St @ Centre St": "1853", "Weld St @ Centre St": "1875", "Weld St @ Cerdan Ave": "1851", "Weld St @ Church St": "1847", "Weld St @ Church St": "1881", "Weld St @ Colby Rd": "1852", "Weld St @ Corey St": "1887", "Weld St @ Gretter Rd": "1878", "Weld St @ Lantern Ln": "1879", "Weld St @ Manthorne Rd": "1845", "Weld St @ Manthorne Rd": "1883", "Weld St @ Maple St": "1843", "Weld St @ Maple St": "1885", "Weld St @ Morey St": "1877", "Weld St @ Ravenna Rd": "1850", "Weld St @ Ruskin St": "1842", "Weld St @ Russet Rd": "1882", "Weld St @ Russett Rd": "1846", "Weld St @ W Roxbury Pkwy": "1848", "Weld St @ W Roxbury Pkwy": "1880", "Weld St @ Willow St": "1844", "Weld St @ Willow St": "1884", "Western Ave @ Everett St": "1049", "Western Ave @ Everett St": "1072", "Western Ave @ Green St": "2444", "Western Ave @ Howard St": "1062", "Western Ave @ Kinnaird St": "1061", "Western Ave @ Litchfield St": "1046", "Western Ave @ Mackin St": "1043", "Western Ave @ N Harvard St": "1070", "Western Ave @ Putnam Ave": "1064", "Western Ave @ Richardson St": "1044", "Western Ave @ Riverdale St": "1589", "Western Ave @ Stadium Way": "1069", "Western Ave @ Travis St": "1051", "Western Ave opp Genzyme": "1067", "Western Ave opp Litchfield St": "1075", "Western Ave opp Richardson St": "1077", "Western Ave opp Riverdale St": "1071", "Weston St @ Cedarwood Ave": "9522", "Wheeler Rd @ Meadowbrook Rd": "84921", "Wheeler Rd @ Meadowbrook Rd": "85371", "Winchester St @ Centre St": "84885", "Winchester St @ Centre St": "85284", "Winchester St @ Dedham St": "84884", "Winchester St @ Goddard St": "85287", "Winchester St @ Needham St": "85285", "Winchester St @ Rachel Rd": "84882", "Winchester St @ Rockland St": "84883", "Winchester St @ Rockland St": "85286", "Winship St @ Union St": "1994", "Winship St @ Union St": "994", "Wiswall Rd @ Chinian Path": "8481", "Wiswall Rd @ Dedham St": "8485", "Wiswall Rd @ Indian Ridge Rd": "8484", "Wiswall Rd @ Indian Ridge Rd": "8546", "Wiswall Rd @ M Roadway": "8549", "Wiswall Rd @ McCarthy Rd": "8483", "Wiswall Rd @ O Roadway": "8548", "Wiswall Rd @ Shumaker Path": "8482", "Wiswall Rd @ Walsh Rd": "8480", "Wiswall Rd @ Walsh Rd": "8550", "Wiswall Rd opp McCarthy Rd": "8547", "Woodward St @ Boylston St": "8152", "Woodward St @ Boylston St": "8207", "Wyman St @ Winter St": "17011", "Wyman St @ Winter St": "18926"}; // Convert colloquial names to stop ids
        var directionDict = {"Southbound": "0", "Northbound": "1", "Westbound": "0", "Eastbound": "1", "Outbound": "0", "Inbound": "1"};

        this.stations = [];
        for (let i = 0; i < this.config.stations.length; i++) {
            this.stations[i] = stationDict[this.config.stations[i]];
        }
        
        this.stationData = []; // Clear station data
        this.filterModes = [];

        if (this.config.showOnly.includes("Subway")) {
            // Light rail and subway are synonymous in Boston
            this.filterModes.push("0");
            this.filterModes.push("1");
        }
        if (this.config.showOnly.includes("Train")) {
            this.filterModes.push("2");
        }
        if (this.config.showOnly.includes("Bus")) {
            this.filterModes.push("3");
        }
        if (this.config.showOnly.includes("Ferry")) {
            this.filterModes.push("4");
        }
        if (this.config.showOnly.includes("Cable car")) {
            this.filterModes.push("5");
        }

        this.filterDirection = [];

        switch (this.config.direction) {
            case "Southbound":
            case "Westbound":
            case "Outbound":
                this.filterDirection.push("0");
                break;
            case "Northbound":
            case "Eastbound":
            case "Inbound":
                this.filterDirection.push("1");
                break;
        }
    },
    
    getDom: function() {
        var wrapper = document.createElement("div");
        
        if (!this.loaded) {
            wrapper.innerHTML += "LOADING";
            wrapper.className = "dimmed light small";
        }
        
        // Check if an API key is in the config
        if (this.config.apikey === "") {
            if (wrapper.innerHTML !== "") {
                wrapper.innerHTML += "<br/>";
            }
            wrapper.innerHTML += "Please set a MBTA api key! This module won't load otherwise!";
            wrapper.className = "dimmed light small";
            return wrapper; // Do not continue updating
        }

        /*-----------------------------------------*/
        
        var table = document.createElement("table");
        table.className = "small";

        // When there are no predictions
        if (this.stationData.length === 0) {
            var row = document.createElement("tr");
            table.appendChild(row);

            // Icon
            var symbolCell = document.createElement("td");
            symbolCell.className = "fa fa-times-circle";
            symbolCell.style.cssText = "padding-right: 10px";
            if (this.config.colorIcons) {
                    symbolCell.className += " red";
                }
            row.appendChild(symbolCell);

            var descCell = document.createElement("td");
            descCell.innerHTML = "No vehicles are scheduled";
            descCell.className = "align-left bright";
            row.appendChild(descCell);
        } else {
            for (let i = 0; i < this.stationData.length; i++) {
                var row = document.createElement("tr");
                table.appendChild(row);
                
                // Icon
                var symbolCell = document.createElement("td");
                switch (this.stationData[i].routeType) {
                    case "0": // Tram/Streetcar/Light Rail case. We'll use the same icon.
                    case "1":
                        symbolCell.className = "fa fa-subway";
                        break;
                    case "2":
                        symbolCell.className = "fa fa-train";
                        break;
                    case "3":
                        symbolCell.className = "fa fa-bus";
                        break;
                    case "4":
                        symbolCell.className = "fa fa-ship";
                        break;
                    case "5": // Suppose to be a cable car but there's no FA icon, so we'll just use the train icon
                        symbolCell.className = "fa fa-train";
                        break;
                    case "6": // Gondola case
                        // There shouldn't be a gondola in Boston.
                    case "7": // Funicular case
                        // There shouldn't be a funicular in Boston.
                    default:
                        symbolCell.className = "fa fa-question-circle-o";
                }

                // Color Icons
                if (this.config.colorIcons) {
                    switch (this.stationData[i].routeId) {
                        case "Red":
                        case "Mattapan":
                            symbolCell.className += " red";
                            break;
                        case "Blue":
                            symbolCell.className += " blue";
                            break;
                        case "Orange":
                            symbolCell.className += " orange";
                            break;
                        case "Green-B":
                        case "Green-C":
                        case "Green-D":
                        case "Green-E":
                            symbolCell.className += " green";
                            break;
                        case "Boat-F1":
                        case "Boat-F4":
                            symbolCell.className += " green";
                            break;
                    }

                    if (this.stationData[i].routeId.includes("CR-")) {
                        symbolCell.className += " commuter"
                    }

                    if (isNaN(this.stationData[i].routeId) === false) {
                        symbolCell.className += " bus"
                    }
                }

                symbolCell.style.cssText = "padding-right: 10px";
                row.appendChild(symbolCell);

                // Description
                var descCell = document.createElement("td");
                descCell.innerHTML = this.stationData[i].tripSign;

                //Change routeId to public route name
                if (isNaN(this.stationData[i].routeId) === false) {
                    switch (this.stationData[i].routeId) {
                        case "741":
                            descCell.innerHTML += " | SL1";
                            break;
                        case "742":
                            descCell.innerHTML += " | SL2";
                            break;
                        case "751":
                            descCell.innerHTML += " | SL4";
                            break;
                        case "749":
                            descCell.innerHTML += " | SL5";
                            break;
                        case "701":
                            descCell.innerHTML += " | CT1";
                            break;
                        case "747":
                            descCell.innerHTML += " | CT2";
                            break;
                        case "708":
                            descCell.innerHTML += " | CT3";
                            break;
                        default:
                            descCell.innerHTML += " | " + routeId;
                    }
                }
                descCell.className = "align-left bright";
                row.appendChild(descCell);
        
                // ETA
                if (this.config.showETATime) {
                    var preETACell = document.createElement("td");
                    var preETATime = this.stationData[i].preETA;
                    
                    if (preETATime == null) {
                        preETACell.innerHTML = "No ETA"
                    } else if (preETATime < 10) { // Better to display single digits as "now"
                        preETACell.innerHTML = "Now";
                    } else {
                        var minutes = Math.floor(preETATime / 60);
                        var seconds = preETATime % 60;
                        
                        if (this.config.showMinutesOnly) {
                            if (!minutes) {
                                preETACell.innerHTML = "No ETA"
                            } else if (minutes === 0) {
                                preETACell.innerHTML = "< 1 min";
                            } else if (minutes === 1) {
                                preETACell.innerHTML = "1 min"
                            } else {
                                preETACell.innerHTML = minutes + " mins";
                            }
                        } else if (this.config.formatETA) { // Parses the time away into MM:SS
                            // Padding so we don't get something like 4:3 minutes...
                            if (seconds < 10) {
                                // lol what even is type casting
                                seconds = "0" + seconds;
                            }
                            preETACell.innerHTML = minutes + ":" + seconds;
                        } else {
                            preETACell.innerHTML = seconds;
                        }
                    }
                    row.appendChild(preETACell);
                }
                
                // Arrival time
                if (this.config.showArrivalTime) {
                    var arrTimeCell = document.createElement("td");
                    if (!this.stationData[i].preArr) {
                        arrTimeCell.innerHTML = "No arrival";
                    } else {
                        if (config.timeFormat === 24) {
                            arrTimeCell.innerHTML = moment.unix(this.stationData[i].preArr).format("H:mm");
                        } else {
                            arrTimeCell.innerHTML = moment.unix(this.stationData[i].preArr).format("h:mm");
                        }
                    }
                    row.appendChild(arrTimeCell);
                }

                // Departure time
                if (this.config.showDepartTime) {
                    var depTimeCell = document.createElement("td");
                    if (!this.stationData[i].preDt) {
                        depTimeCell.innerHTML = "No depart";
                    } else {
                        if (config.timeFormat === 24) {
                            depTimeCell.innerHTML = moment.unix(this.stationData[i].preDt).format("H:mm");
                        } else {
                            depTimeCell.innerHTML = moment.unix(this.stationData[i].preDt).format("h:mm");
                        }
                    }
                    row.appendChild(depTimeCell);
                }
                
                // Stolen from default modules to ensure style is identical. Thanks MichMich <3
                if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = this.stationData.length * this.config.fadePoint;
                    var steps = this.stationData.length - startingPoint;
                    if (i >= startingPoint) {
                        var currentStep = i - startingPoint;
                        row.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }
            }
        };
        
        wrapper.appendChild(table);

        // Don't start the update loop on first init
        if (this.loaded) {
            this.scheduleUpdate();
        }

        // Alerts
        let uniqueAlerts = new Set();

        for (let i = 0; i < this.stationData.length; i++) {
            for (let j = 0; j < this.stationData[i].alerts.length; j++) {
                uniqueAlerts.add(this.stationData[i].alerts[j]);
            }
        }

        if (this.config.showAlerts) {
            if (uniqueAlerts.size === 0 && this.config.hideEmptyAlerts === false) {
                var alertHeader = document.createElement("header");
                alertHeader.className = "module-header alerts";
                alertHeader.innerHTML = "Alerts";
                wrapper.appendChild(alertHeader);
                    
                var alertTable = document.createElement("table");
                alertTable.className = "small";

                var row = document.createElement("tr");
                alertTable.appendChild(row);
                alertTable.style.cssText = "width: inherit";

                var alertCell = document.createElement("td");
                alertCell.innerHTML = "No alerts";
                alertCell.className = "light small";
                row.appendChild(alertCell);

                wrapper.appendChild(alertTable);
            } else if (uniqueAlerts.size > 0) {
                var alertHeader = document.createElement("header");
                alertHeader.className = "module-header alerts";
                alertHeader.innerHTML = "Alerts";
                wrapper.appendChild(alertHeader);
                    
                var alertTable = document.createElement("table");
                alertTable.className = "small";

                for (let alert of uniqueAlerts) {
                    var alertText = alert;
                    
                    var row = document.createElement("tr");
                    alertTable.appendChild(row);
                    alertTable.style.cssText = "width: inherit";
                    
                    var alertCell = document.createElement("td");
                    alertCell.innerHTML = alertText;
                    alertCell.className = "light small alert";
                    row.appendChild(alertCell);
                }
                wrapper.appendChild(alertTable);
            }
        }
        return wrapper;
    },
    
    notificationReceived: function(notification, payload, sender) {
        if (notification === "DOM_OBJECTS_CREATED") {
            Log.log(this.name + " received a system notification: " + notification);
            this.fetchData(true);
            Log.log("updating dom");
        }
    },

    scheduleUpdate: function(amt) {
        var interval = (amt !== undefined) ? amt : this.config.updateInterval;

        var self = this;
        setTimeout(function() {
            self.fetchData();
            if (self.config.doAnimation) {
                self.updateDom(self.config.animationSpeed);
            } else {
                self.updateDom();
            }
        }, interval * 1000);
    },
    
    // params: updateDomAfter: boolean, whether or not to call updateDom() after processing data.
    fetchData: function(updateDomAfter) {
        for (let stop in this.stations) {
            var url = this.formUrl(this.stations[stop]);
            var MBTARequest = new XMLHttpRequest();
            MBTARequest.open("GET", url, true);
            
            var self = this;
            MBTARequest.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        self.loopData(JSON.parse(this.response), updateDomAfter);
                    }
                }
            };
            MBTARequest.send();
        }
    },
    
    // Gets API URL based off user settings
    formUrl: function(stopId) {
        var url = this.config.baseUrl;
        
        if (this.config.predictedTimes) {
            url += "predictions";
        } else {
            url += "schedules";
        }

        url += "?api_key=" + this.config.apikey; 
        url += "&filter[stop]=" + stopId;
        url += "&include=stop,route,trip,alerts&sort=arrival_time";

        // Gets (maxEntries + 10) schedules or all schedules up to 3 hours from now, whichever is lower
        // Page and time limits necessary because otherwise "schedules" endpoint gets every single schedule
        if (!this.config.predictedTimes) {
            url += "&page[limit]=" + (maxEntries + 10) + '"';
            url += "&filter[min_time]=" + moment().format("HH:mm");
            url += "&filter[max_time]=" + moment().add(3, 'h').format("HH:mm");
        }
        return url;
    },

    fetchRoute: function(data, updateDomAfter, pred, routeId, tripId, alertIds, rawData) {
        var deferredPromise = $.Deferred();

        var routeUrl = this.detailsUrl("routes",routeId);
        var routeRequest = new XMLHttpRequest();
        routeRequest.open("GET", routeUrl, true);

        var self = this;
        routeRequest.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    self.fetchTrip(data, updateDomAfter, pred, JSON.parse(this.response), tripId, alertIds, rawData, deferredPromise)
                } else if (this.status === 404) {
                    self.fetchTrip(data, updateDomAfter, pred, "Unavailable", tripId, alertIds, rawData, deferredPromise);
                }
            }
        };
        routeRequest.send();

        return deferredPromise;
    },

    fetchTrip: function(data, updateDomAfter, pred, routeParse, tripId, alertId, rawData, promise) {
        var tripUrl = this.detailsUrl("trips",tripId);
        var tripRequest = new XMLHttpRequest();
        tripRequest.open("GET", tripUrl, true);

        var self = this;
        tripRequest.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    self.fetchAlerts(data, updateDomAfter, pred, routeParse, JSON.parse(this.response), alertIds, rawData, promise);
                } else if (this.status === 404) {
                    self.fetchAlerts(data, updateDomAfter, pred, routeParse, "Unavailable", alertIds, rawData, promise);
                }
            }
        };
        tripRequest.send();
    },

    fetchAlerts: function(data, updateDomAfter, pred, routeParse, tripParse, alertIds, rawData, promise) {
        var alertPromises = [];
        var self = this;
        alertIds.forEach(function(alert) {
            var alertPromise = $.Deferred();
            alertPromises.push(alertPromise);

            var alertId = alert.id

            var alertUrl = self.detailsUrl("alerts", alertId);
            var alertRequest = new XMLHttpRequest();
            alertRequest.open("GET", alertUrl, true);

            alertRequest.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        alertPromise.resolve(JSON.parse(this.response));
                    } else if (this.status === 404) {
                        alertPromise.resolve("Unavailable");
                    }
                }
            };
            alertRequest.send();
        });

        $.when(...alertPromises).then(function(...alertsParse) {
            self.processData(data, updateDomAfter, pred, routeParse, tripParse, alertsParse, rawData);
            promise.resolve();
        });
    },

    detailsUrl: function(detail,id) {
        var url = this.config.baseUrl;
        url += detail + '/';
        url += id;
        url += "?api_key=" + this.config.apikey;

        return url;
    },

    loopData: function(data, updateDomAfter) {
        this.stationData = [ ]; // clear all data.
        var rawData = [ ];
        var promises = [];

        if (data.data.length === 0) {
            this.loaded = true;
            this.updateDom();
        } else {
            for (let pred = 0; pred < data["data"].length; pred++) {
                routeId = data.data[pred].relationships.route.data.id;
                tripId = data.data[pred].relationships.trip.data.id;
                alertIds = data.data[pred].relationships.alerts.data;

                promises.push(this.fetchRoute(data, updateDomAfter, pred, routeId, tripId, alertIds, rawData));
            }

            var that = this;
            $.when(...promises).then(function() {
                that.cleanData(data, rawData, updateDomAfter);
            });
        }
    },
    
    // updateDomAfter: immediatelly call updateDom() if true
    processData: function(data, updateDomAfter, pred, routeParse, tripParse, alertsParse, rawData) {
        /* Each element in this array is an entry on our displayed table:
        {"routeType": string,
         "routeId": string,
         "tripSign": string,
         "directionId": string,
         "alerts": array,
         "preDt": int,
         "preArr": int,
         "preETA": int
        } */

        alertsArray = [];
        for (let alert of alertsParse) {
            if (alert.data) {
                alertsArray.push(alert.data.attributes.header);
            }
        };
        routeType = routeParse.data.attributes.type.toString();
        routeId = routeParse.data.id;
        if (tripParse.data) {
            tripSign = tripParse.data.attributes.headsign;
            directionId = tripParse.data.attributes.direction_id.toString();
        } else {
            tripSign = "Name unavailable"
            directionId = "Direction unavailable"
        }
        preDt = parseInt(moment(data.data[pred].attributes.departure_time).format("X"));
        preArr = parseInt(moment(data.data[pred].attributes.arrival_time).format("X"));
        preETA = moment(data.data[pred].attributes.arrival_time).diff(moment(), 'seconds') - 30; //Better safe than sorry?

        rawData.push({
            routeType: routeType,
            routeId: routeId,
            tripSign: tripSign,
            directionId: directionId,
            alerts: alertsArray,
            preDt: preDt,
            preArr: preArr,
            preETA: preETA
        });
    },
        
    cleanData: function(data, rawData, updateDomAfter) {
        // Filters out items
        // This simply doesn't run when the param is empty.
        var self = this;
        for (let i = 0; i < this.filterModes.length; i++) {
            var temp = rawData.filter(obj => (obj.routeType === self.filterModes[i]));

            // For some reason a for-each loop won't work.
            for (let x = 0; x < temp.length; x++) {
                this.stationData.push(temp[x]);
            }
        }
        
        if (this.filterModes.length === 0) {
            this.stationData = rawData;
        }

        // Sorts them according to ETA time
        this.stationData.sort((a,b) => (a.preETA - b.preETA));
        
        // Remove trips beyond maxTime
        if (this.config.maxTime !== 0) {
            this.stationData = this.stationData.filter(obj => (obj.preETA <= this.config.maxTime * 60));
        }
        
        // Shortens the array
        this.stationData.length = Math.min(this.stationData.length, this.config.maxEntries);

        this.loaded = true;
        if (updateDomAfter) {
            this.updateDom();
        }
    }
});
