document.addEventListener('DOMContentLoaded', () => {
    const fromToken = document.getElementById('fromToken');
    const toToken = document.getElementById('toToken');
    const fromAmount = document.getElementById('fromAmount');
    const result = document.getElementById('result');
    const swapButton = document.getElementById('swapButton');

    function setTokenSelectImage(select) {
        const selectedOption = select.options[select.selectedIndex];
        const imageUrl = selectedOption.getAttribute('data-image');
        select.style.backgroundImage = `url('${imageUrl}'), url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`;
    }

    setTokenSelectImage(fromToken);
    setTokenSelectImage(toToken);

    fromToken.addEventListener('change', () => setTokenSelectImage(fromToken));
    toToken.addEventListener('change', () => setTokenSelectImage(toToken));

    async function calculateSwap() {
        try {
            const amount = parseFloat(fromAmount.value);
            if (isNaN(amount) || amount <= 0) {
                result.textContent = '0.000';
                return;
            }

            const fromSymbol = fromToken.value;
            const toSymbol = toToken.value;

            result.textContent = 'Loading...';

            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fromSymbol},${toSymbol}&vs_currencies=usd`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !data[fromSymbol] || !data[toSymbol]) {
                throw new Error('Invalid price data received');
            }

            const fromPrice = data[fromSymbol].usd;
            const toPrice = data[toSymbol].usd;

            if (!fromPrice || !toPrice) {
                throw new Error('Missing price data');
            }

            const convertedAmount = (amount * fromPrice) / toPrice;
            result.textContent = convertedAmount.toFixed(3);

        } catch (error) {
            console.error('Error calculating swap:', error);
            result.textContent = 'Error: Could not fetch prices';
        }
    }

    let timeoutId;
    const debouncedCalculateSwap = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(calculateSwap, 500);
    };

    fromAmount.addEventListener('input', debouncedCalculateSwap);
    fromToken.addEventListener('change', debouncedCalculateSwap);
    toToken.addEventListener('change', debouncedCalculateSwap);

    swapButton.addEventListener('click', () => {
        const tempValue = fromToken.value;
        fromToken.value = toToken.value;
        toToken.value = tempValue;
        setTokenSelectImage(fromToken);
        setTokenSelectImage(toToken);
        calculateSwap();
    });
}); 