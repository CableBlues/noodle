<?php
// api/discounts.php: Aggregated Weekly Discounter & Supermarket Deals API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: public, max-age=3600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$stores = [
    'aldi' => [
        'name' => 'Aldi',
        'color' => '#0284c7',
        'badge' => 'Aldi Deals',
        'icon' => 'shopping-bag'
    ],
    'lidl' => [
        'name' => 'Lidl',
        'color' => '#eab308',
        'badge' => 'Lidl Plus',
        'icon' => 'percent'
    ],
    'rewe' => [
        'name' => 'Rewe',
        'color' => '#dc2626',
        'badge' => 'Beste Wahl',
        'icon' => 'tag'
    ],
    'penny' => [
        'name' => 'Penny',
        'color' => '#ea580c',
        'badge' => 'Penny Knüller',
        'icon' => 'flame'
    ],
    'kaufland' => [
        'name' => 'Kaufland',
        'color' => '#9333ea',
        'badge' => 'Card Deal',
        'icon' => 'award'
    ],
    'edeka' => [
        'name' => 'Edeka',
        'color' => '#16a34a',
        'badge' => 'Gut & Günstig',
        'icon' => 'heart'
    ]
];

// Current Curated Discount Catalog (Refreshed weekly)
$allDeals = [
    // --- ALDI ---
    [
        'id' => 'deal-aldi-01',
        'store' => 'aldi',
        'name' => 'Bio Vollmilch 3.8%',
        'originalPrice' => 1.49,
        'price' => 1.09,
        'discountPct' => 27,
        'unit' => '1 L',
        'dept' => 'dairy',
        'badge' => 'Bio Hit',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-aldi-02',
        'store' => 'aldi',
        'name' => 'Deutsche Markenbutter',
        'originalPrice' => 2.29,
        'price' => 1.39,
        'discountPct' => 39,
        'unit' => '250 g',
        'dept' => 'dairy',
        'badge' => 'Super-Knüller',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-aldi-03',
        'store' => 'aldi',
        'name' => 'Bananen Bio Fairtrade',
        'originalPrice' => 1.99,
        'price' => 1.29,
        'discountPct' => 35,
        'unit' => '1 kg',
        'dept' => 'produce',
        'badge' => 'Fairtrade',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-aldi-04',
        'store' => 'aldi',
        'name' => 'Natives Olivenöl Extra',
        'originalPrice' => 8.99,
        'price' => 5.99,
        'discountPct' => 33,
        'unit' => '750 ml',
        'dept' => 'pantry',
        'badge' => 'Aktion',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-aldi-05',
        'store' => 'aldi',
        'name' => 'Lachsfilet frisch mit Haut',
        'originalPrice' => 5.99,
        'price' => 4.29,
        'discountPct' => 28,
        'unit' => '300 g',
        'dept' => 'meat',
        'badge' => 'Frische-Tipp',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-aldi-06',
        'store' => 'aldi',
        'name' => 'Haferflocken Zart & Kernig',
        'originalPrice' => 0.79,
        'price' => 0.49,
        'discountPct' => 38,
        'unit' => '500 g',
        'dept' => 'bakery',
        'badge' => 'Dauer-Günstig',
        'validUntil' => 'Sa. diese Woche'
    ],

    // --- LIDL ---
    [
        'id' => 'deal-lidl-01',
        'store' => 'lidl',
        'name' => 'Barista Hafermilch Ungesüßt',
        'originalPrice' => 1.89,
        'price' => 1.19,
        'discountPct' => 37,
        'unit' => '1 L',
        'dept' => 'dairy',
        'badge' => 'Lidl Plus',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-lidl-02',
        'store' => 'lidl',
        'name' => 'Gouda jung in Scheiben',
        'originalPrice' => 2.69,
        'price' => 1.69,
        'discountPct' => 37,
        'unit' => '400 g',
        'dept' => 'dairy',
        'badge' => 'XXL Packung',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-lidl-03',
        'store' => 'lidl',
        'name' => 'Avocados Ready-to-Eat',
        'originalPrice' => 2.49,
        'price' => 1.49,
        'discountPct' => 40,
        'unit' => '2er Pack',
        'dept' => 'produce',
        'badge' => 'Knaller',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-lidl-04',
        'store' => 'lidl',
        'name' => 'Lavazza Crema e Aroma Bohnen',
        'originalPrice' => 14.99,
        'price' => 9.99,
        'discountPct' => 33,
        'unit' => '1 kg',
        'dept' => 'drinks',
        'badge' => 'Marken-Highlight',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-lidl-05',
        'store' => 'lidl',
        'name' => 'Hähnchen-Brustfilet Teilstücke',
        'originalPrice' => 7.49,
        'price' => 4.99,
        'discountPct' => 33,
        'unit' => '600 g',
        'dept' => 'meat',
        'badge' => 'Frische-Hit',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-lidl-06',
        'store' => 'lidl',
        'name' => 'Italienische Pasta Spaghetti & Penne',
        'originalPrice' => 1.19,
        'price' => 0.69,
        'discountPct' => 42,
        'unit' => '500 g',
        'dept' => 'bakery',
        'badge' => '42% Sparen',
        'validUntil' => 'Sa. diese Woche'
    ],

    // --- REWE ---
    [
        'id' => 'deal-rewe-01',
        'store' => 'rewe',
        'name' => 'Kerrygold Original Irische Butter',
        'originalPrice' => 3.29,
        'price' => 1.99,
        'discountPct' => 40,
        'unit' => '250 g',
        'dept' => 'dairy',
        'badge' => 'Wochen-Knüller',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-rewe-02',
        'store' => 'rewe',
        'name' => 'Barilla Pasta Sorten',
        'originalPrice' => 1.99,
        'price' => 0.88,
        'discountPct' => 56,
        'unit' => '500 g',
        'dept' => 'bakery',
        'badge' => 'Top Sparpreis',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-rewe-03',
        'store' => 'rewe',
        'name' => 'Jacobs Krönung Kaffee gemahlen',
        'originalPrice' => 6.99,
        'price' => 4.44,
        'discountPct' => 36,
        'unit' => '500 g',
        'dept' => 'drinks',
        'badge' => 'Kaffee-Hit',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-rewe-04',
        'store' => 'rewe',
        'name' => 'Bio Freilandeier Gr. M/L',
        'originalPrice' => 3.29,
        'price' => 2.49,
        'discountPct' => 24,
        'unit' => '10er Pack',
        'dept' => 'dairy',
        'badge' => 'Bio Region',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-rewe-05',
        'store' => 'rewe',
        'name' => 'Bio Gurken aus Deutschland',
        'originalPrice' => 1.49,
        'price' => 0.79,
        'discountPct' => 47,
        'unit' => '1 Stück',
        'dept' => 'produce',
        'badge' => 'Lokal & Bio',
        'validUntil' => 'Sa. diese Woche'
    ],

    // --- PENNY ---
    [
        'id' => 'deal-penny-01',
        'store' => 'penny',
        'name' => 'Ritter Sport Bunte Vielfalt',
        'originalPrice' => 1.49,
        'price' => 0.88,
        'discountPct' => 41,
        'unit' => '100 g',
        'dept' => 'pantry',
        'badge' => 'Penny Knüller',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-penny-02',
        'store' => 'penny',
        'name' => 'Speisekartoffeln festkochend',
        'originalPrice' => 3.49,
        'price' => 1.99,
        'discountPct' => 43,
        'unit' => '2.5 kg',
        'dept' => 'produce',
        'badge' => 'Sack-Preis',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-penny-03',
        'store' => 'penny',
        'name' => 'Coca-Cola / Fanta / Sprite',
        'originalPrice' => 1.49,
        'price' => 0.99,
        'discountPct' => 34,
        'unit' => '1.25 L',
        'dept' => 'drinks',
        'badge' => 'Erfrischung',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-penny-04',
        'store' => 'penny',
        'name' => 'Toilettenpapier 3-lagig sanft',
        'originalPrice' => 4.29,
        'price' => 2.99,
        'discountPct' => 30,
        'unit' => '10x 200 Blatt',
        'dept' => 'household',
        'badge' => 'Haushalts-Hit',
        'validUntil' => 'Sa. diese Woche'
    ],

    // --- KAUFLAND ---
    [
        'id' => 'deal-kaufland-01',
        'store' => 'kaufland',
        'name' => 'Gemischtes Hackfleisch Rind & Schwein',
        'originalPrice' => 5.49,
        'price' => 3.49,
        'discountPct' => 36,
        'unit' => '500 g',
        'dept' => 'meat',
        'badge' => 'Kaufland Card',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-kaufland-02',
        'store' => 'kaufland',
        'name' => 'Äpfel Gala / Elstar Tafeläpfel',
        'originalPrice' => 2.99,
        'price' => 1.59,
        'discountPct' => 47,
        'unit' => '1 kg',
        'dept' => 'produce',
        'badge' => 'Knack-Frisch',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-kaufland-03',
        'store' => 'kaufland',
        'name' => 'Dallmayr Prodomo Spitzenkaffee',
        'originalPrice' => 7.49,
        'price' => 4.99,
        'discountPct' => 33,
        'unit' => '500 g',
        'dept' => 'drinks',
        'badge' => 'Kaffee des Monats',
        'validUntil' => 'Sa. diese Woche'
    ],

    // --- EDEKA ---
    [
        'id' => 'deal-edeka-01',
        'store' => 'edeka',
        'name' => 'Mozzarella di Bufala Campana',
        'originalPrice' => 2.49,
        'price' => 1.49,
        'discountPct' => 40,
        'unit' => '125 g',
        'dept' => 'dairy',
        'badge' => 'Gourmet Deal',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-edeka-02',
        'store' => 'edeka',
        'name' => 'Bio Rispen-Tomaten aromatisch',
        'originalPrice' => 2.99,
        'price' => 1.79,
        'discountPct' => 40,
        'unit' => '500 g',
        'dept' => 'produce',
        'badge' => 'Bio Qualität',
        'validUntil' => 'Sa. diese Woche'
    ],
    [
        'id' => 'deal-edeka-03',
        'store' => 'edeka',
        'name' => 'Pesto Alla Genovese Barilla',
        'originalPrice' => 3.29,
        'price' => 1.99,
        'discountPct' => 39,
        'unit' => '190 g',
        'dept' => 'pantry',
        'badge' => 'Genuss-Hit',
        'validUntil' => 'Sa. diese Woche'
    ]
];

// Query Parameters Filtering
$storeFilter = isset($_GET['store']) ? strtolower(trim($_GET['store'])) : 'all';
$searchQuery = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
$deptFilter = isset($_GET['dept']) ? strtolower(trim($_GET['dept'])) : 'all';

$filtered = array_filter($allDeals, function($deal) use ($storeFilter, $searchQuery, $deptFilter) {
    if ($storeFilter !== 'all' && $deal['store'] !== $storeFilter) {
        return false;
    }
    if ($deptFilter !== 'all' && $deal['dept'] !== $deptFilter) {
        return false;
    }
    if (!empty($searchQuery)) {
        $nameMatch = strpos(strtolower($deal['name']), $searchQuery) !== false;
        $badgeMatch = isset($deal['badge']) && strpos(strtolower($deal['badge']), $searchQuery) !== false;
        if (!$nameMatch && !$badgeMatch) {
            return false;
        }
    }
    return true;
});

echo json_encode([
    'success' => true,
    'timestamp' => date('c'),
    'count' => count($filtered),
    'stores' => $stores,
    'deals' => array_values($filtered)
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
