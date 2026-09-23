const TELEGRAM_TOKEN = "8934050378:AAEn7Qpahylmme18aamXPGPpzZ_Jl8W0jzc";
  const TELEGRAM_CHAT_ID = "5015049584";
  const PRICE = 280;
  const DELIVERY = { inside: 80, outside: 120 };

  let qty = 1;
  let area = "inside";
  let payment = "bKash";
  let color = "গ্রে";

  const qtyVal = document.getElementById('qtyVal');
  const sumSubtotal = document.getElementById('sumSubtotal');
  const sumDelivery = document.getElementById('sumDelivery');
  const sumTotal = document.getElementById('sumTotal');

  function renderSummary(){
    qtyVal.textContent = qty;
    const subtotal = PRICE * qty;
    const delivery = DELIVERY[area];
    sumSubtotal.textContent = '৳' + subtotal;
    sumDelivery.textContent = '৳' + delivery;
    sumTotal.textContent = '৳' + (subtotal + delivery);
  }

  document.getElementById('qtyMinus').addEventListener('click', () => { if(qty>1){ qty--; renderSummary(); } });
  document.getElementById('qtyPlus').addEventListener('click', () => { if(qty<10){ qty++; renderSummary(); } });

  document.querySelectorAll('input[name="area"]').forEach(r => {
    r.addEventListener('change', (e) => {
      area = e.target.value;
      document.getElementById('areaInsideLabel').classList.toggle('active', area==='inside');
      document.getElementById('areaOutsideLabel').classList.toggle('active', area==='outside');
      renderSummary();
    });
  });

  document.querySelectorAll('input[name="color"]').forEach(r => {
    r.addEventListener('change', (e) => {
      color = e.target.value;
      document.getElementById('colorGreyLabel').classList.toggle('active', color==='গ্রে');
      document.getElementById('colorWhiteLabel').classList.toggle('active', color==='হোয়াইট');
    });
  });

  const payDetails = { bKash: 'bkashDetail', Nagad: 'nagadDetail', 'Cash on Delivery': 'codDetail' };
  const payLabels = { bKash: 'payBkashLabel', Nagad: 'payNagadLabel', 'Cash on Delivery': 'payCodLabel' };
  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', (e) => {
      payment = e.target.value;
      Object.values(payDetails).forEach(id => document.getElementById(id).classList.remove('show'));
      Object.values(payLabels).forEach(id => document.getElementById(id).classList.remove('active'));
      document.getElementById(payDetails[payment]).classList.add('show');
      document.getElementById(payLabels[payment]).classList.add('active');
    });
  });

  renderSummary();

  const form = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');
  const formMsg = document.getElementById('formMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.className = ''; formMsg.style.display = 'none';

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if(!name || !phone || !address){
      formMsg.textContent = 'দয়া করে নাম, মোবাইল নাম্বার ও ঠিকানা পূরণ করুন।';
      formMsg.className = 'err'; formMsg.style.display = 'block';
      return;
    }
    if(!/^01[0-9]{9}$/.test(phone)){
      formMsg.textContent = 'সঠিক মোবাইল নাম্বার দিন (যেমনঃ 01XXXXXXXXX)।';
      formMsg.className = 'err'; formMsg.style.display = 'block';
      return;
    }

    let trxId = 'প্রযোজ্য নয় (Cash on Delivery)';
    if(payment === 'bKash'){
      trxId = document.getElementById('bkashTrx').value.trim();
      if(!trxId){
        formMsg.textContent = 'bKash Transaction ID দিন।';
        formMsg.className = 'err'; formMsg.style.display = 'block';
        return;
      }
    } else if(payment === 'Nagad'){
      trxId = document.getElementById('nagadTrx').value.trim();
      if(!trxId){
        formMsg.textContent = 'Nagad Transaction ID দিন।';
        formMsg.className = 'err'; formMsg.style.display = 'block';
        return;
      }
    }

    const subtotal = PRICE * qty;
    const delivery = DELIVERY[area];
    const total = subtotal + delivery;
    const areaLabel = area === 'inside' ? 'ঢাকার মধ্যে' : 'ঢাকার বাহিরে';

    const text =
`🛒 নতুন অর্ডার — Nittyo Hub

📦 পণ্য: মাল্টিফাংশনাল ফ্রিজ ডোর লক
🎨 রঙ: ${color}
🔢 পরিমাণ: ${qty}
💰 মূল্য: ৳${subtotal}
🚚 ডেলিভারি এলাকা: ${areaLabel} (৳${delivery})
🧾 সর্বমোট: ৳${total}

👤 নাম: ${name}
📞 ফোন: ${phone}
🏠 ঠিকানা: ${address}

💳 পেমেন্ট মেথড: ${payment}
🔖 Transaction ID: ${trxId}`;

    submitBtn.disabled = true;
    submitBtn.textContent = 'পাঠানো হচ্ছে...';

    try{
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
      });
      const data = await res.json();
      console.log('Telegram response:', data);
      if(data.ok){
        formMsg.textContent = 'ধন্যবাদ! আপনার অর্ডার সফলভাবে জমা হয়েছে। শীঘ্রই আমরা কল করে কনফার্ম করব।';
        formMsg.className = 'ok'; formMsg.style.display = 'block';
        form.reset();
        qty = 1; area = 'inside'; payment = 'bKash'; color = 'গ্রে';
        document.getElementById('colorGreyLabel').classList.add('active');
        document.getElementById('colorWhiteLabel').classList.remove('active');
        document.getElementById('areaInsideLabel').classList.add('active');
        document.getElementById('areaOutsideLabel').classList.remove('active');
        document.getElementById('bkashDetail').classList.add('show');
        document.getElementById('nagadDetail').classList.remove('show');
        document.getElementById('codDetail').classList.remove('show');
        document.getElementById('payBkashLabel').classList.add('active');
        document.getElementById('payNagadLabel').classList.remove('active');
        document.getElementById('payCodLabel').classList.remove('active');
        renderSummary();
      } else {
        throw new Error(data.description || 'Telegram error');
      }
    } catch(err){
      console.error('Order send failed:', err);
      formMsg.textContent = 'দুঃখিত, অর্ডার পাঠাতে সমস্যা হয়েছে (' + err.message + ')। আবার চেষ্টা করুন অথবা WhatsApp করুন 01818-656498।';
      formMsg.className = 'err'; formMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'অর্ডার কনফার্ম করুন';
    }
  });
