import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const updatedAt = '20 avril 2026';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Politique de confidentialite' }} />

      <Text style={styles.title}>Politique de confidentialite</Text>
      <Text style={styles.subtitle}>Monmarche Livreur</Text>
      <Text style={styles.updatedAt}>Derniere mise a jour : {updatedAt}</Text>

      <Section
        title="1. Objet"
        body="Cette application est utilisee par les livreurs pour consulter des commandes, scanner des QR codes et confirmer la livraison des commandes."
      />

      <Section
        title="2. Donnees utilisees"
        body="L'application peut traiter les donnees strictement necessaires au fonctionnement du service : informations de connexion, identifiants de commande, nom du client, adresse de livraison, numero de telephone et statut de livraison."
      />

      <Section
        title="3. Camera"
        body="La camera est utilisee uniquement pour scanner les QR codes des commandes. L'application n'enregistre pas de photo ou de video a partir de cet usage."
      />

      <Section
        title="4. Finalite"
        body="Les donnees sont utilisees pour authentifier les livreurs, afficher les commandes a traiter, faciliter la collecte, confirmer la livraison et assurer le suivi operationnel du service."
      />

      <Section
        title="5. Partage des donnees"
        body="Les donnees ne sont pas vendues. Elles sont accessibles uniquement aux personnes, services et prestataires techniques necessaires a l'exploitation de la solution de livraison."
      />

      <Section
        title="6. Conservation"
        body="Les donnees sont conservees pendant la duree necessaire a la gestion des commandes, a la tracabilite des livraisons et au respect des obligations legales ou contractuelles applicables."
      />

      <Section
        title="7. Securite"
        body="Des mesures techniques et organisationnelles raisonnables sont mises en place pour limiter l'acces non autorise, la divulgation ou la modification non autorisee des donnees traitees."
      />

      <Section
        title="8. Vos droits"
        body="Selon la legislation applicable, vous pouvez demander l'acces, la rectification ou la suppression des donnees personnelles vous concernant en utilisant le moyen de contact communique dans la fiche Google Play de l'application ou par le canal de support de l'entreprise."
      />

      <Section
        title="9. Contact"
        body="Pour toute question relative a cette politique de confidentialite, utilisez les coordonnees de contact communiquees par l'entreprise exploitant le service Monmarche Livreur."
      />
    </ScrollView>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f3ee',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#1f1f1f',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#ff5a1f',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  updatedAt: {
    color: '#666',
    fontSize: 14,
    marginBottom: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: '#1f1f1f',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBody: {
    color: '#444',
    fontSize: 14,
    lineHeight: 22,
  },
});
