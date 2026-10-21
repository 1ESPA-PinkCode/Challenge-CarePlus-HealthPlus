// app/(tabs)/recompensas.jsx — banca de doces: gemas viram doces
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Icone from "../../components/Icone";
import BarraProgresso from "../../components/BarraProgresso";
import { colors } from "../../constants/colors";
import { useUsuario } from "../../context/UsuarioContext";
import { useGemas } from "../../contexts/GemsContext";

export default function Recompensas() {
  const { gemas, preco, compras, carregarDoces } = useGemas();
  const { perfil } = useUsuario();
  const podeComprar = Math.floor(gemas / preco);
  const faltam = preco - (gemas % preco);

  useFocusEffect(
    useCallback(() => {
      carregarDoces();
    }, [carregarDoces])
  );

  // enquanto está na fila da banca, o saldo se atualiza sozinho
  useEffect(() => {
    const t = setInterval(carregarDoces, 10000);
    return () => clearInterval(t);
  }, [carregarDoces]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>Banca de doces</Text>
      </View>

      {/* saldo */}
      <View style={styles.saldoCard}>
        <Text style={styles.saldoLabel}>Suas gemas</Text>
        <View style={styles.saldoLinha}>
          <Text style={styles.saldoValor}>{gemas}</Text>
          <Image source={require("../../assets/images/gema.png")} style={styles.gema} resizeMode="contain" />
        </View>
        <Text style={styles.saldoSub}>
          {podeComprar > 0
            ? `Dá para trocar por ${podeComprar} ${podeComprar === 1 ? "doce" : "doces"}!`
            : `Faltam ${faltam} gemas para o seu primeiro doce`}
        </Text>
        {podeComprar === 0 && (
          <View style={{ alignSelf: "stretch", marginTop: 10 }}>
            <BarraProgresso progress={gemas / preco} height={10} />
          </View>
        )}
      </View>

      {/* como comprar */}
      <View style={styles.comoCard}>
        <View style={styles.comoTopo}>
          <Icone nome="storefront" tamanho={44} tom="amarelo" />
          <View style={{ flex: 1 }}>
            <Text style={styles.comoTitulo}>1 doce = {preco} gemas</Text>
            <Text style={styles.comoTexto}>Vá até a banca do Health Plus e mostre o seu código. A equipe entrega o doce e desconta as gemas.</Text>
          </View>
        </View>
        <Text style={styles.codigoLabel}>Seu código</Text>
        <Text style={styles.codigo}>#{perfil?.codigo_pessoal || "----"}</Text>
      </View>

      <View style={styles.premio}>
        <Icone nome="trophy" tamanho={40} tom="verde" />
        <Text style={styles.premioTexto}>
          Comprar doces não tira você do ranking: ele conta todas as gemas que você já ganhou. O 1º lugar às 18:00 leva uma caixa de bombom!
        </Text>
      </View>

      {/* histórico */}
      {compras.length > 0 && (
        <>
          <Text style={styles.secao}>Doces que você já pegou ({compras.length})</Text>
          {compras.map((c, i) => (
            <View key={c.codigo} style={styles.compra}>
              <Icone nome="ice-cream" tamanho={36} tom={["agua", "lima", "menta", "petroleo"][i % 4]} />
              <Text style={styles.compraTexto}>Doce retirado</Text>
              <Text style={styles.compraHora}>
                {new Date(c.entregue_em || c.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Text style={styles.compraPreco}>−{preco}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  titleBox: { backgroundColor: colors.primary, borderRadius: 30, paddingVertical: 18, paddingHorizontal: 24, marginBottom: 14 },
  title: { fontSize: 30, fontWeight: "800", color: colors.white },

  saldoCard: { backgroundColor: "#EAF3DC", borderRadius: 22, padding: 18, alignItems: "center", marginBottom: 12 },
  saldoLabel: { fontSize: 14, fontWeight: "700", color: "#5A6B2F" },
  saldoLinha: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 4 },
  saldoValor: { fontSize: 52, fontWeight: "900", color: colors.primary },
  gema: { width: 44, height: 44 },
  saldoSub: { fontSize: 15, fontWeight: "700", color: colors.primary },

  comoCard: { borderWidth: 2, borderColor: colors.green4, borderStyle: "dashed", borderRadius: 22, padding: 16, marginBottom: 12, alignItems: "center" },
  comoTopo: { flexDirection: "row", gap: 12, alignItems: "center", alignSelf: "stretch" },
  comoTitulo: { fontSize: 17, fontWeight: "900", color: "#1A1A1A" },
  comoTexto: { fontSize: 13, color: "#4A4A4A", marginTop: 2, lineHeight: 18 },
  codigoLabel: { fontSize: 13, color: "#8A8A8A", fontWeight: "700", marginTop: 14 },
  codigo: { fontSize: 46, fontWeight: "900", color: colors.primary, letterSpacing: 5 },

  premio: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FBF1B8", borderRadius: 18, padding: 14, marginBottom: 16 },
  premioTexto: { flex: 1, fontSize: 13, color: "#5A6B2F", fontWeight: "700", lineHeight: 18 },

  secao: { fontSize: 15, color: "#9AA98C", fontWeight: "700", marginBottom: 8 },
  compra: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E6EFE0" },
  compraTexto: { flex: 1, fontSize: 15, fontWeight: "800", color: "#1A1A1A" },
  compraHora: { fontSize: 13, color: "#8A8A8A" },
  compraPreco: { fontSize: 16, fontWeight: "900", color: "#C0392B", minWidth: 40, textAlign: "right" },
});
