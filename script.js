document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const conversionResult = document.getElementById('conversionResult');
    const apiStatus = document.getElementById('apiStatus');

    const costLocationSelect = document.getElementById('costLocation');
    const costDetailsDiv = document.getElementById('costDetails');

    // --- Currency Converter Logic ---
    const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'; // Free API endpoint (base USD)
    let exchangeRates = {}; // Store fetched rates

    // Hardcoded common currencies for display if API fails or for initial setup
    const defaultCurrencies = {
        "USD": 1.0,
        "EUR": 0.92, // Example static rate
        "GBP": 0.79,
        "JPY": 156.9,
        "CAD": 1.37,
        "AUD": 1.50,
        "THB": 36.7, // Thai Baht
        "INR": 83.5, // Indian Rupee
        "IDR": 16250, // Indonesian Rupiah
        "VND": 25450, // Vietnamese Dong
        "MXN": 16.6, // Mexican Peso
    };

    async function fetchExchangeRates() {
        apiStatus.textContent = 'Fetching latest exchange rates...';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            exchangeRates = data.rates;
            apiStatus.textContent = 'Exchange rates updated.';
            populateCurrencyDropdowns(Object.keys(exchangeRates));
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            apiStatus.textContent = 'Could not fetch live rates. Using default rates. (API might be rate-limited or down)';
            exchangeRates = defaultCurrencies; // Fallback to default rates
            populateCurrencyDropdowns(Object.keys(defaultCurrencies));
        }
    }

    function populateCurrencyDropdowns(currencies) {
        fromCurrencySelect.innerHTML = '';
        toCurrencySelect.innerHTML = '';

        currencies.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            fromCurrencySelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            toCurrencySelect.appendChild(option2);
        });

        // Set default selections
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
    }

    function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            conversionResult.textContent = 'Please enter a valid amount.';
            return;
        }

        if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
            conversionResult.textContent = 'Exchange rate data not available for selected currencies.';
            return;
        }

        // Convert amount to USD base first, then to target currency
        const amountInUSD = amount / exchangeRates[fromCurrency];
        const convertedAmount = amountInUSD * exchangeRates[toCurrency];

        conversionResult.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
    }

    // --- Local Costs Logic ---

    // IMPORTANT: These are illustrative, hardcoded averages.
    // In a real application, this data would come from a comprehensive database
    // that is frequently updated and covers many more locations.
    const LOCAL_COSTS_DATA = {
        "bangkok_thb": {
            name: "Bangkok, Thailand (THB)",
            currency: "THB",
            items: {
                "Taxi (short ride)": "50-100", // Baht
                "Tuk-Tuk (short ride)": "80-150",
                "Street Food Meal": "40-80",
                "Restaurant Meal (mid-range)": "150-300",
                "Bottle of Water (supermarket)": "10-20",
                "Local Beer": "60-120",
                "1kg Bananas (market)": "30-50",
                "Hostel Dorm (per night)": "200-400",
                "Budget Hotel (per night)": "500-1000",
            }
        },
        "rome_eur": {
            name: "Rome, Italy (EUR)",
            currency: "EUR",
            items: {
                "Taxi (short ride)": "8-15", // Euro
                "Bus/Metro Ticket": "1.50",
                "Pizza (local pizzeria)": "7-12",
                "Restaurant Meal (mid-range)": "15-30",
                "Bottle of Water (supermarket)": "0.50-1",
                "Local Beer": "4-6",
                "1kg Bananas (market)": "1.50-2.50",
                "Hostel Dorm (per night)": "25-50",
                "Budget Hotel (per night)": "70-120",
            }
        },
        "mexico_city_mxn": {
            name: "Mexico City, Mexico (MXN)",
            currency: "MXN",
            items: {
                "Taxi/Uber (short ride)": "50-100", // Mexican Pesos
                "Metro Ticket": "5",
                "Taco Stand Meal": "30-60",
                "Restaurant Meal (mid-range)": "150-300",
                "Bottle of Water (supermarket)": "10-15",
                "Local Beer": "30-50",
                "1kg Bananas (market)": "20-40",
                "Hostel Dorm (per night)": "200-400",
                "Budget Hotel (per night)": "500-1000",
            }
        },
        // Add more destinations here
    };

    function populateCostLocations() {
        costLocationSelect.innerHTML = '<option value="">-- Select --</option>'; // Default empty option
        for (const key in LOCAL_COSTS_DATA) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = LOCAL_COSTS_DATA[key].name;
            costLocationSelect.appendChild(option);
        }
    }

    function displayLocalCosts() {
        const selectedKey = costLocationSelect.value;
        if (!selectedKey) {
            costDetailsDiv.innerHTML = '<p>Select a destination to see average costs.</p>';
            return;
        }

        const data = LOCAL_COSTS_DATA[selectedKey];
        let html = `<h3>Costs in ${data.name}</h3>`;
        html += `<p>All costs are approximate and in **${data.currency}**.</p>`;
        html += '<ul>';
        for (const item in data.items) {
            html += `<li><strong>${item}:</strong> ${data.items[item]} ${data.currency}</li>`;
        }
        html += '</ul>';
        html += '<p style="font-size: 0.9em; color: #666;"><em>These are average estimates and can vary based on exact location, time of year, negotiation, and personal choices.</em></p>';
        costDetailsDiv.innerHTML = html;
    }

    // --- Event Listeners ---
    convertBtn.addEventListener('click', convertCurrency);
    amountInput.addEventListener('input', convertCurrency); // Convert on input change
    fromCurrencySelect.addEventListener('change', convertCurrency);
    toCurrencySelect.addEventListener('change', convertCurrency);

    costLocationSelect.addEventListener('change', displayLocalCosts);

    // --- Initial Load ---
    fetchExchangeRates(); // Fetch rates when the page loads
    populateCostLocations(); // Populate location dropdown
});