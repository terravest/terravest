-- 1. Token Miktarı Asla Eksi Olamaz
CREATE TRIGGER IF NOT EXISTS prevent_negative_tokens
BEFORE UPDATE ON investments
FOR EACH ROW
WHEN NEW.token_amount < 0
BEGIN
    SELECT RAISE(ABORT, 'Safety Trigger: Token amount cannot be negative');
END;

-- 2. USD Bakiyesi Asla Eksi Olamaz
CREATE TRIGGER IF NOT EXISTS prevent_negative_balance
BEFORE UPDATE ON users
FOR EACH ROW
WHEN NEW.usd_balance < 0
BEGIN
    SELECT RAISE(ABORT, 'Safety Trigger: USD Balance cannot be negative');
END;