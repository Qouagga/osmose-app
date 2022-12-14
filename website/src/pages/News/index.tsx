import {PageTitle} from "../../components/PageTitle";
import {CardArticle} from "../../components/CardArticle";

import "./styles.css";

import phoque from "../../img/articles/phoque.png";

export const News: React.FC = () => {
  return (
    <div className="parallax">
    <div className="wrapper ">
      <PageTitle
        >
          <h1>News</h1>
      </PageTitle>

      <CardArticle
          title="XXIV RNE seminar"
          stringDate="15/12/2022"
        >
          <p className="">
            Attendees : Julie Béesau – Maëlle Torterotot – Mathieu Dupont
          </p>
          <p>
            The annual RNE (Réseau National Échouage – French Stranding Network)
            seminar was held the 19th and 20th of November in Saint Valéry sur
            Sommes, near the Baie de Somme. The RNE is NGO that keeps track of
            marine mammals strandings along the French coast since 1970. All
            scientific actions are led by Pelagis, a national marine mammals and
            seabirds observatory. This year’ seminary was jointly organised by
            Pelagis, Picardie Nature association, Office Français de la
            Biodiversité (OFB) and gathered more than 120 people from all over
            the country.
        </p>
        <blockquote className="blockquote text-center">
        <p>
            “Every year a seminar is organised by Pelagis, the network leader.
            It is an opportunity to forge links with collaborators from all
            walks of life and to exchange knowledge on the state of marine
            mammal populations in environments as different as Rouzic or
            Martinique.”
          </p>
          <footer className="blockquote-footer">Source:{" "}
            <a href="www.observatoire-pelagis.cnrs.fr">
              www.observatoire-pelagis.cnrs.fr
            </a></footer>
        </blockquote>
          
        
        <img src={phoque} alt="Faune sauvage" title="Faune sauvage"/>
          <p>
            The theme for this seminar was “Anthropic pressures and associated
            impact”. This subject is closely related to the APOCADO project
            (lien page projet). The first results of CETIROISE and APOCADO
            projects and more generally the benefits of passive acoustics to
            monitor marine mammals populations were presented along with
            different presentations from several other speakers from Saturday to
            mid-Sunday. The presentations will be available soon on{" "}
            <a href="https://www.observatoire-pelagis.cnrs.fr/echouages/seminaires-rne/">
              Pelagis website
            </a>
            .
          </p>
          <p>
            On Sunday afternoon we had the chance to go out and watch the
            biggest seal colony in France which is settled in the Baie de
            Sommes, just a short drive from the seminar’s location. We spotted a
            group of Harbor seals (Phoca vitulina) and some Atlantic grey seals
            (Halichoerus grypus) in the distance. They lay on Baie de Somme
            beaches to get some rest, give birth, attend to the pups or shed. It
            was a reminder that one should not get too close from these animals
            as they are easily frightened and one might put the well-being of
            the pups in jeopardy.
          </p>

          <p>
            Thanks to all the participants and to the organisation who put this
            event together!
          </p>
        </CardArticle>
        
        <CardArticle
        title="XXIV RNE seminar"
        stringDate="01/01/2022"
        >
          <p className="">
            Attendees : Julie Béesau – Maëlle Torterotot – Mathieu Dupont
          </p>
          <p>
            The annual RNE (Réseau National Échouage – French Stranding Network)
            seminar was held the 19th and 20th of November in Saint Valéry sur
            Sommes, near the Baie de Somme. The RNE is NGO that keeps track of
            marine mammals strandings along the French coast since 1970. All
            scientific actions are led by Pelagis, a national marine mammals and
            seabirds observatory. This year’ seminary was jointly organised by
            Pelagis, Picardie Nature association, Office Français de la
            Biodiversité (OFB) and gathered more than 120 people from all over
            the country.
          </p>
          <p className="quote">
            “Every year a seminar is organised by Pelagis, the network leader.
            It is an opportunity to forge links with collaborators from all
            walks of life and to exchange knowledge on the state of marine
            mammal populations in environments as different as Rouzic or
            Martinique.” Source:{" "}
            <a href="www.observatoire-pelagis.cnrs.fr">
              www.observatoire-pelagis.cnrs.fr
            </a>
          </p>
          <p>
            The theme for this seminar was “Anthropic pressures and associated
            impact”. This subject is closely related to the APOCADO project
            (lien page projet). The first results of CETIROISE and APOCADO
            projects and more generally the benefits of passive acoustics to
            monitor marine mammals populations were presented along with
            different presentations from several other speakers from Saturday to
            mid-Sunday. The presentations will be available soon on{" "}
            <a href="https://www.observatoire-pelagis.cnrs.fr/echouages/seminaires-rne/">
              Pelagis website
            </a>
            .
          </p>
          <p>
            On Sunday afternoon we had the chance to go out and watch the
            biggest seal colony in France which is settled in the Baie de
            Sommes, just a short drive from the seminar’s location. We spotted a
            group of Harbor seals (Phoca vitulina) and some Atlantic grey seals
            (Halichoerus grypus) in the distance. They lay on Baie de Somme
            beaches to get some rest, give birth, attend to the pups or shed. It
            was a reminder that one should not get too close from these animals
            as they are easily frightened and one might put the well-being of
            the pups in jeopardy.
          </p>

          <p>
            Thanks to all the participants and to the organisation who put this
            event together!
          </p>
      </CardArticle>

      <CardArticle
        title="XXIV RNE seminar"
        stringDate="01/01/2022"
        >
          <p className="">
            Attendees : Julie Béesau – Maëlle Torterotot – Mathieu Dupont
          </p>
          <p>
            The annual RNE (Réseau National Échouage – French Stranding Network)
            seminar was held the 19th and 20th of November in Saint Valéry sur
            Sommes, near the Baie de Somme. The RNE is NGO that keeps track of
            marine mammals strandings along the French coast since 1970. All
            scientific actions are led by Pelagis, a national marine mammals and
            seabirds observatory. This year’ seminary was jointly organised by
            Pelagis, Picardie Nature association, Office Français de la
            Biodiversité (OFB) and gathered more than 120 people from all over
            the country.
          </p>
          <p className="quote">
            “Every year a seminar is organised by Pelagis, the network leader.
            It is an opportunity to forge links with collaborators from all
            walks of life and to exchange knowledge on the state of marine
            mammal populations in environments as different as Rouzic or
            Martinique.” Source:{" "}
            <a href="www.observatoire-pelagis.cnrs.fr">
              www.observatoire-pelagis.cnrs.fr
            </a>
          </p>
          <p>
            The theme for this seminar was “Anthropic pressures and associated
            impact”. This subject is closely related to the APOCADO project
            (lien page projet). The first results of CETIROISE and APOCADO
            projects and more generally the benefits of passive acoustics to
            monitor marine mammals populations were presented along with
            different presentations from several other speakers from Saturday to
            mid-Sunday. The presentations will be available soon on{" "}
            <a href="https://www.observatoire-pelagis.cnrs.fr/echouages/seminaires-rne/">
              Pelagis website
            </a>
            .
          </p>
          <p>
            On Sunday afternoon we had the chance to go out and watch the
            biggest seal colony in France which is settled in the Baie de
            Sommes, just a short drive from the seminar’s location. We spotted a
            group of Harbor seals (Phoca vitulina) and some Atlantic grey seals
            (Halichoerus grypus) in the distance. They lay on Baie de Somme
            beaches to get some rest, give birth, attend to the pups or shed. It
            was a reminder that one should not get too close from these animals
            as they are easily frightened and one might put the well-being of
            the pups in jeopardy.
          </p>

          <p>
            Thanks to all the participants and to the organisation who put this
            event together!
          </p>
        </CardArticle>

        <div className="end_space"></div>
      {/*<section className="container my-5">
        <CardArticle
          title="XXIV RNE seminar"
          img={phoque}
          imgAlt="Dorian’s portrait."
        >
          <p className="">
            Attendees : Julie Béesau – Maëlle Torterotot – Mathieu Dupont
          </p>
          <p>
            The annual RNE (Réseau National Échouage – French Stranding Network)
            seminar was held the 19th and 20th of November in Saint Valéry sur
            Sommes, near the Baie de Somme. The RNE is NGO that keeps track of
            marine mammals strandings along the French coast since 1970. All
            scientific actions are led by Pelagis, a national marine mammals and
            seabirds observatory. This year’ seminary was jointly organised by
            Pelagis, Picardie Nature association, Office Français de la
            Biodiversité (OFB) and gathered more than 120 people from all over
            the country.
          </p>
          <p className="quote">
            “Every year a seminar is organised by Pelagis, the network leader.
            It is an opportunity to forge links with collaborators from all
            walks of life and to exchange knowledge on the state of marine
            mammal populations in environments as different as Rouzic or
            Martinique.” Source:{" "}
            <a href="www.observatoire-pelagis.cnrs.fr">
              www.observatoire-pelagis.cnrs.fr
            </a>
          </p>
          <p>
            The theme for this seminar was “Anthropic pressures and associated
            impact”. This subject is closely related to the APOCADO project
            (lien page projet). The first results of CETIROISE and APOCADO
            projects and more generally the benefits of passive acoustics to
            monitor marine mammals populations were presented along with
            different presentations from several other speakers from Saturday to
            mid-Sunday. The presentations will be available soon on{" "}
            <a href="https://www.observatoire-pelagis.cnrs.fr/echouages/seminaires-rne/">
              Pelagis website
            </a>
            .
          </p>
          <p>
            On Sunday afternoon we had the chance to go out and watch the
            biggest seal colony in France which is settled in the Baie de
            Sommes, just a short drive from the seminar’s location. We spotted a
            group of Harbor seals (Phoca vitulina) and some Atlantic grey seals
            (Halichoerus grypus) in the distance. They lay on Baie de Somme
            beaches to get some rest, give birth, attend to the pups or shed. It
            was a reminder that one should not get too close from these animals
            as they are easily frightened and one might put the well-being of
            the pups in jeopardy.
          </p>

          <p>
            Thanks to all the participants and to the organisation who put this
            event together!
          </p>
        </CardArticle>
  </section>*/}
      </div>
      </div>
  );
};
